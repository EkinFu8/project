export const SECTION_MOTION = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" as const },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.2, ease: "easeInOut" as const },
};

export const FORMAT_OPTIONS = [
  { key: "pdf", label: "PDF" },
  { key: "word", label: "Word" },
  { key: "excel", label: "Excel" },
  { key: "powerpoint", label: "PowerPoint" },
  { key: "text", label: "Text" },
  { key: "csv", label: "CSV" },
  { key: "png", label: "PNG" },
  { key: "jpeg", label: "JPEG" },
  { key: "gif", label: "GIF" },
  { key: "svg", label: "SVG" },
  { key: "other", label: "Other" },
] as const;

export type FormatOption = (typeof FORMAT_OPTIONS)[number];
