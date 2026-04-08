import { useCallback, useRef, useState } from "react";
import type * as React from "react";
import { cn } from "../lib/utils";

interface FileUploadProps {
  label: string;
  /** Called when a file is selected (before upload) */
  onFileSelect: (file: File) => void;
  /** Accepted file types, e.g. ".pdf,.docx,.png" */
  accept?: string;
  /** Max file size in bytes (default 50 MiB) */
  maxSize?: number;
  /** Whether the upload is currently in progress */
  isUploading?: boolean;
  /** Upload progress 0-100 */
  progress?: number;
  /** Currently uploaded file name to display */
  currentFileName?: string;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileUpload({
  label,
  onFileSelect,
  accept,
  maxSize = 50 * 1024 * 1024,
  isUploading = false,
  progress = 0,
  currentFileName,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      if (file.size > maxSize) {
        setError(`File is too large. Maximum size is ${formatFileSize(maxSize)}.`);
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);
    },
    [maxSize, onFileSelect],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const displayName = currentFileName ?? selectedFile?.name;

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-foreground">{label}</label>

      <button
        type="button"
        disabled={disabled || isUploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex w-full cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed px-4 py-8 transition-colors",
          "hover:border-hanover-green hover:bg-hanover-green/5",
          "focus:outline-none focus:ring-2 focus:ring-hanover-green",
          isDragOver && "border-hanover-green bg-hanover-green/5",
          !isDragOver && "border-border bg-white",
          (disabled || isUploading) && "cursor-not-allowed opacity-60",
        )}
      >
        {isUploading ? (
          <div className="flex w-full flex-col items-center gap-2">
            <svg
              className="h-8 w-8 animate-spin text-hanover-green"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-sm font-medium text-foreground">Uploading...</p>
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-hanover-green transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
          </div>
        ) : (
          <>
            <svg
              className="mb-2 h-8 w-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm font-medium text-foreground">
              {displayName ? "Replace file" : "Click to upload or drag and drop"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {accept ? `Accepted: ${accept}` : "Any file type"} &middot; Max{" "}
              {formatFileSize(maxSize)}
            </p>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        tabIndex={-1}
      />

      {displayName && !isUploading && (
        <div className="mt-2 flex items-center gap-2 rounded border border-border bg-gray-50 px-3 py-2 text-sm">
          <svg
            className="h-4 w-4 shrink-0 text-hanover-green"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="truncate text-foreground">{displayName}</span>
          {selectedFile && (
            <span className="shrink-0 text-xs text-muted-foreground">
              ({formatFileSize(selectedFile.size)})
            </span>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

export type { FileUploadProps };
export { FileUpload };
