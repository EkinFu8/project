import { prisma } from "../lib/prisma";
import { extractText } from "./ocr";

// Track in-flight jobs so we don't double-queue the same file.
const inFlight = new Set<string>();

/**
 * Fire-and-forget: enqueue a file for OCR extraction.
 * Returns immediately; the extraction runs in the background.
 */
export function enqueueOcr(fileID: string): void {
  if (inFlight.has(fileID)) return;
  inFlight.add(fileID);

  runOcr(fileID).finally(() => inFlight.delete(fileID));
}

async function runOcr(fileID: string): Promise<void> {
  const record = await prisma.contentManagement.findUnique({
    where: { fileID },
    select: { url: true, format: true },
  });

  if (!record?.url) {
    await prisma.contentManagement.update({
      where: { fileID },
      data: { ocr_status: "skipped", ocr_updated_at: new Date() },
    });
    return;
  }

  await prisma.contentManagement.update({
    where: { fileID },
    data: { ocr_status: "processing", ocr_error: null },
  });

  try {
    const { text, skipped } = await extractText(record.url, record.format);

    await prisma.contentManagement.update({
      where: { fileID },
      data: {
        extracted_text: text,
        ocr_status: skipped ? "skipped" : "done",
        ocr_error: null,
        ocr_updated_at: new Date(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[ocr] failed for ${fileID}:`, message);

    await prisma.contentManagement.update({
      where: { fileID },
      data: {
        ocr_status: "failed",
        ocr_error: message,
        ocr_updated_at: new Date(),
      },
    });
  }
}
