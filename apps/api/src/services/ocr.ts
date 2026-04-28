import { createWorker } from "tesseract.js";
import * as XLSX from "xlsx";

// Lazy singleton Tesseract worker — initialising one per call is too slow.
let tesseractWorker: Awaited<ReturnType<typeof createWorker>> | null = null;

async function getTesseractWorker() {
  if (!tesseractWorker) {
    tesseractWorker = await createWorker("eng");
  }
  return tesseractWorker;
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch file: ${res.status} ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function extractFromPdf(buf: Buffer): Promise<string | null> {
  // Dynamic import so pdfjs-dist (which uses globalThis) only loads when needed.
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buf) });
  const pdf = await loadingTask.promise;

  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .trim();
    if (pageText) parts.push(pageText);
  }

  return parts.length > 0 ? parts.join("\n") : null;
}

async function extractFromImage(buf: Buffer): Promise<string> {
  const worker = await getTesseractWorker();
  const { data } = await worker.recognize(buf);
  return data.text.trim();
}

async function extractFromDocx(buf: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer: buf });
  return result.value.trim();
}

async function extractFromXlsx(buf: Buffer): Promise<string> {
  const wb = XLSX.read(buf, { type: "buffer" });
  const parts: string[] = [];
  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) continue;
    const csv = XLSX.utils.sheet_to_csv(sheet);
    if (csv.trim()) parts.push(csv.trim());
  }
  return parts.join("\n");
}

async function extractFromPptx(buf: Buffer): Promise<string> {
  // pptx files are zip archives — extract text nodes from slide XML manually.
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(buf);
  const parts: string[] = [];
  const slideFiles = Object.keys(zip.files).filter((name) =>
    /^ppt\/slides\/slide\d+\.xml$/.test(name),
  );
  slideFiles.sort();
  for (const slideFile of slideFiles) {
    const entry = zip.files[slideFile];
    if (!entry) continue;
    const xml = await entry.async("string");
    // Extract all <a:t> text elements
    const matches = xml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g);
    const texts = [...matches].map((m) => m[1] ?? "").filter(Boolean);
    if (texts.length) parts.push(texts.join(" "));
  }
  return parts.join("\n");
}

function extractFromSvg(buf: Buffer): string {
  const svg = buf.toString("utf-8");
  const matches = svg.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/gi);
  return [...matches]
    .map((m) => (m[1] ?? "").replace(/<[^>]+>/g, "").trim())
    .filter(Boolean)
    .join(" ");
}

/**
 * Extract plain text from a file at the given public URL.
 * Returns null when the format is not supported or yields no text (skipped).
 */
export async function extractText(
  fileUrl: string,
  format: string | null | undefined,
): Promise<{ text: string | null; skipped: boolean }> {
  const fmt = (format ?? "").toLowerCase();

  // Plain text formats — just fetch and decode, no heavy libs needed.
  if (fmt === "txt" || fmt === "csv") {
    const buf = await fetchBuffer(fileUrl);
    return { text: buf.toString("utf-8").trim() || null, skipped: false };
  }

  if (fmt === "pdf") {
    const buf = await fetchBuffer(fileUrl);
    const text = await extractFromPdf(buf);
    if (text === null) {
      // No text layer — scanned PDF, skip per product decision.
      return { text: null, skipped: true };
    }
    return { text, skipped: false };
  }

  if (fmt === "png" || fmt === "jpg" || fmt === "jpeg" || fmt === "gif") {
    const buf = await fetchBuffer(fileUrl);
    const text = await extractFromImage(buf);
    return { text: text || null, skipped: false };
  }

  if (fmt === "docx" || fmt === "doc") {
    const buf = await fetchBuffer(fileUrl);
    const text = await extractFromDocx(buf);
    return { text: text || null, skipped: false };
  }

  if (fmt === "xlsx" || fmt === "xls") {
    const buf = await fetchBuffer(fileUrl);
    const text = await extractFromXlsx(buf);
    return { text: text || null, skipped: false };
  }

  if (fmt === "pptx" || fmt === "ppt") {
    const buf = await fetchBuffer(fileUrl);
    const text = await extractFromPptx(buf);
    return { text: text || null, skipped: false };
  }

  if (fmt === "svg") {
    const buf = await fetchBuffer(fileUrl);
    const text = extractFromSvg(buf);
    return { text: text || null, skipped: false };
  }

  // Unsupported format
  return { text: null, skipped: true };
}
