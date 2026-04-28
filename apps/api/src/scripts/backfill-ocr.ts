/**
 * One-time backfill: process all existing documents whose OCR status is
 * 'pending' or 'failed'. Run with:
 *
 *   pnpm --filter @myapp/api tsx src/scripts/backfill-ocr.ts
 *
 * Re-running is safe — it only processes pending/failed records.
 */

import "../load-env.ts";
import { prisma } from "../lib/prisma";
import { extractText } from "../services/ocr";

const BATCH_SIZE = 5;

async function main() {
  const records = await prisma.contentManagement.findMany({
    where: { ocr_status: { in: ["pending", "failed"] } },
    select: { fileID: true, url: true, format: true, filename: true },
    orderBy: { fileID: "asc" },
  });

  console.log(`[backfill] ${records.length} records to process`);

  let done = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (record) => {
        if (!record.url) {
          await prisma.contentManagement.update({
            where: { fileID: record.fileID },
            data: { ocr_status: "skipped", ocr_updated_at: new Date() },
          });
          skipped++;
          return;
        }

        await prisma.contentManagement.update({
          where: { fileID: record.fileID },
          data: { ocr_status: "processing" },
        });

        try {
          const { text, skipped: isSkipped } = await extractText(record.url, record.format);

          await prisma.contentManagement.update({
            where: { fileID: record.fileID },
            data: {
              extracted_text: text,
              ocr_status: isSkipped ? "skipped" : "done",
              ocr_error: null,
              ocr_updated_at: new Date(),
            },
          });

          if (isSkipped) skipped++;
          else done++;

          console.log(
            `[backfill] ✓ ${record.filename ?? record.fileID} (${isSkipped ? "skipped" : "done"})`,
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          await prisma.contentManagement.update({
            where: { fileID: record.fileID },
            data: { ocr_status: "failed", ocr_error: message, ocr_updated_at: new Date() },
          });
          failed++;
          console.error(`[backfill] ✗ ${record.filename ?? record.fileID}: ${message}`);
        }
      }),
    );

    console.log(
      `[backfill] progress: ${Math.min(i + BATCH_SIZE, records.length)}/${records.length}`,
    );
  }

  console.log(`\n[backfill] complete — done: ${done}, skipped: ${skipped}, failed: ${failed}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
