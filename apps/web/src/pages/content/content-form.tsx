import { FileUpload } from "@myapp/ui/components/file-upload";
import { TextInput } from "@myapp/ui/components/text-input";
import { ArrowLeft, FileText, Loader2, Pencil } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useFileUpload } from "@/hooks/use-file-upload";
import { type RouterOutputs, trpc } from "@/lib/trpc.ts";

function formatDateField(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

function toNullable<T extends string>(value: T | ""): T | null {
  return (value || null) as T | null;
}

function isImageFilename(name: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(name);
}

function displayDateLabel(value: string): string {
  if (!value?.trim()) return "—";
  const d = new Date(value + "T12:00:00");
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

type ContentFormFieldsProps = {
  isEditing: boolean;
  fileID: string;
  setFileID: (v: string) => void;
  filename: string;
  setFilename: (v: string) => void;
  url: string;
  setUrl: (v: string) => void;
  ownerId: string;
  setOwnerId: (v: string) => void;
  jobPosition: string;
  setJobPosition: (v: string) => void;
  lastModified: string;
  setLastModified: (v: string) => void;
  expirationDate: string;
  setExpirationDate: (v: string) => void;
  contentType: string;
  setContentType: (v: string) => void;
  documentStatus: string;
  setDocumentStatus: (v: string) => void;
  employees: RouterOutputs["employee"]["list"] | undefined;
  upload: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  createError: ReturnType<typeof trpc.content.create.useMutation>["error"];
  updateError: ReturnType<typeof trpc.content.update.useMutation>["error"];
  isSaving: boolean;
  onSubmit: (e: React.FormEvent) => void;
};

function ContentFormFields({
  isEditing,
  fileID,
  setFileID,
  filename,
  setFilename,
  url,
  setUrl,
  ownerId,
  setOwnerId,
  jobPosition,
  setJobPosition,
  lastModified,
  setLastModified,
  expirationDate,
  setExpirationDate,
  contentType,
  setContentType,
  documentStatus,
  setDocumentStatus,
  employees,
  upload,
  isUploading,
  uploadProgress,
  uploadError,
  createError,
  updateError,
  isSaving,
  onSubmit,
}: ContentFormFieldsProps) {
  const [metadataEditMode, setMetadataEditMode] = useState(false);
  const showFileSummary = isEditing && Boolean(url) && !metadataEditMode;
  const ownerDisplayName =
    employees?.find((e) => e.id === ownerId)?.name ?? (ownerId ? ownerId : "Unassigned");

  useEffect(() => {
    setMetadataEditMode(false);
  }, [fileID]);

  const mutationError = createError?.message || updateError?.message || "Something went wrong.";
  const submitLabel = isUploading ? "Uploading..." : isEditing ? "Update Content" : "Save Content";
  const acceptTypes = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.gif,.svg";

  return (
    <div className="border-t border-border/60 py-8 sm:py-10">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <Link
          to="/hero/content"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Content
        </Link>

        <h1 className="mb-6 text-2xl font-bold text-foreground">
          {isEditing ? "Edit Content" : "New Content"}
        </h1>

        <div className="rounded-xl border border-border bg-card p-6 shadow-md sm:p-8">
          <form className="space-y-6" onSubmit={onSubmit}>
            {showFileSummary ? (
              <>
                <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                  <div className="flex min-h-[200px] max-h-80 items-center justify-center bg-muted/50">
                    {isImageFilename(filename) && url ? (
                      <img
                        src={url}
                        alt=""
                        className="max-h-80 max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 px-8 py-12 text-muted-foreground">
                        <FileText className="h-16 w-16 opacity-35" strokeWidth={1.25} />
                        <span className="text-sm font-medium text-foreground/80">Preview</span>
                        {filename ? (
                          <span className="max-w-full truncate text-xs">{filename}</span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                <FileUpload
                  label="Replace file"
                  onFileSelect={upload}
                  accept={acceptTypes}
                  isUploading={isUploading}
                  progress={uploadProgress}
                  currentFileName={url ? filename : undefined}
                  disabled={isSaving}
                  compact
                  hideFileNameRow
                />

                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Metadata
                  </h2>
                  <button
                    type="button"
                    onClick={() => setMetadataEditMode(true)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                    Edit details
                  </button>
                </div>

                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-border last:border-b-0">
                        <th
                          scope="row"
                          className="w-[38%] bg-muted/40 px-4 py-3 text-left align-top font-medium text-muted-foreground"
                        >
                          File ID
                        </th>
                        <td className="px-4 py-3 font-mono text-xs text-foreground">{fileID}</td>
                      </tr>
                      <tr className="border-b border-border last:border-b-0">
                        <th
                          scope="row"
                          className="bg-muted/40 px-4 py-3 text-left align-top font-medium text-muted-foreground"
                        >
                          Filename
                        </th>
                        <td className="px-4 py-3 text-foreground">{filename || "—"}</td>
                      </tr>
                      <tr className="border-b border-border last:border-b-0">
                        <th
                          scope="row"
                          className="bg-muted/40 px-4 py-3 text-left align-top font-medium text-muted-foreground"
                        >
                          URL
                        </th>
                        <td className="max-w-0 px-4 py-3">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-hanover-green underline hover:text-hanover-green/90"
                          >
                            {url}
                          </a>
                        </td>
                      </tr>
                      <tr className="border-b border-border last:border-b-0">
                        <th
                          scope="row"
                          className="bg-muted/40 px-4 py-3 text-left align-top font-medium text-muted-foreground"
                        >
                          Content owner
                        </th>
                        <td className="px-4 py-3 text-foreground">{ownerDisplayName}</td>
                      </tr>
                      <tr className="border-b border-border last:border-b-0">
                        <th
                          scope="row"
                          className="bg-muted/40 px-4 py-3 text-left align-top font-medium text-muted-foreground"
                        >
                          Job position
                        </th>
                        <td className="px-4 py-3 text-foreground">{jobPosition || "—"}</td>
                      </tr>
                      <tr className="border-b border-border last:border-b-0">
                        <th
                          scope="row"
                          className="bg-muted/40 px-4 py-3 text-left align-top font-medium text-muted-foreground"
                        >
                          Last modified
                        </th>
                        <td className="px-4 py-3 text-foreground">{displayDateLabel(lastModified)}</td>
                      </tr>
                      <tr className="border-b border-border last:border-b-0">
                        <th
                          scope="row"
                          className="bg-muted/40 px-4 py-3 text-left align-top font-medium text-muted-foreground"
                        >
                          Expiration
                        </th>
                        <td className="px-4 py-3 text-foreground">{displayDateLabel(expirationDate)}</td>
                      </tr>
                      <tr className="border-b border-border last:border-b-0">
                        <th
                          scope="row"
                          className="bg-muted/40 px-4 py-3 text-left align-top font-medium text-muted-foreground"
                        >
                          Content type
                        </th>
                        <td className="px-4 py-3 text-foreground">{contentType || "—"}</td>
                      </tr>
                      <tr className="border-b border-border last:border-b-0">
                        <th
                          scope="row"
                          className="bg-muted/40 px-4 py-3 text-left align-top font-medium text-muted-foreground"
                        >
                          Status
                        </th>
                        <td className="px-4 py-3 text-foreground">{documentStatus || "—"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {(createError || updateError) && (
                  <div className="rounded border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {mutationError}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-hanover-green px-6 py-3 font-semibold text-white transition-colors hover:bg-hanover-green/90 disabled:opacity-60"
                  >
                    {(isSaving || isUploading) && <Loader2 className="h-4 w-4 animate-spin" />}
                    {submitLabel}
                  </button>
                </div>
              </>
            ) : (
              <>
                <FileUpload
                  label="Upload File"
                  onFileSelect={upload}
                  accept={acceptTypes}
                  isUploading={isUploading}
                  progress={uploadProgress}
                  currentFileName={url ? filename : undefined}
                  disabled={isSaving}
                />

                {isEditing && url ? (
                  <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                    <div className="flex min-h-[140px] max-h-48 items-center justify-center bg-muted/50">
                      {isImageFilename(filename) && url ? (
                        <img
                          src={url}
                          alt=""
                          className="max-h-48 max-w-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                          <FileText className="h-10 w-10 opacity-35" strokeWidth={1.25} />
                          <span className="text-xs">Preview</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {isEditing && url ? (
                  <FileUpload
                    label="Replace file"
                    onFileSelect={upload}
                    accept={acceptTypes}
                    isUploading={isUploading}
                    progress={uploadProgress}
                    currentFileName={url ? filename : undefined}
                    disabled={isSaving}
                    compact
                    hideFileNameRow
                  />
                ) : null}

                {url && !isEditing ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-foreground">Uploaded to:</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-hanover-green underline hover:text-hanover-green/80"
                    >
                      {filename || url}
                    </a>
                  </div>
                ) : null}

                <hr className="border-border" />
              </>
            )}

            {uploadError && (
              <div className="rounded border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                Upload failed: {uploadError}
              </div>
            )}

            {!showFileSummary ? (
              <>
                <TextInput
              label="File ID"
              type="text"
              required
              maxLength={64}
              disabled={isEditing}
              value={fileID}
              onChange={(e) => setFileID(e.target.value)}
            />
            <TextInput
              label="Filename"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
            <TextInput
              label="URL"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            {/* Owner */}
            <div>
              <label htmlFor="owner" className="mb-2 block text-sm font-semibold text-foreground">
                Content Owner
              </label>
              <select
                id="owner"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="w-full rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-hanover-green"
              >
                <option value="">Unassigned</option>
                {employees?.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                    {emp.employee_code ? ` (${emp.employee_code})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <TextInput
              label="Job Position"
              type="text"
              value={jobPosition}
              onChange={(e) => setJobPosition(e.target.value)}
            />
            <TextInput
              label="Last Modified"
              type="date"
              value={lastModified}
              onChange={(e) => setLastModified(e.target.value)}
            />
            <TextInput
              label="Expiration Date"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />

            {/* Content Type */}
            <div>
              <label
                htmlFor="content-type"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Content Type
              </label>
              <select
                id="content-type"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-hanover-green"
              >
                <option value="">—</option>
                <option value="Reference">Reference</option>
                <option value="Workflow">Workflow</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="mb-2 block text-sm font-semibold text-foreground">
                Status
              </label>
              <select
                id="status"
                value={documentStatus}
                onChange={(e) => setDocumentStatus(e.target.value)}
                className="w-full rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-hanover-green"
              >
                <option value="">—</option>
                <option value="Created">Created</option>
                <option value="in-progress">In Progress</option>
                <option value="Finalized">Finalized</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

                {(createError || updateError) && (
                  <div className="rounded border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {mutationError}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {isEditing && url && metadataEditMode ? (
                    <button
                      type="button"
                      onClick={() => setMetadataEditMode(false)}
                      className="order-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted sm:order-1"
                    >
                      Back to summary
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="order-1 flex flex-1 items-center justify-center gap-2 rounded-md bg-hanover-green py-3 font-semibold text-white transition-colors hover:bg-hanover-green/90 disabled:opacity-60 sm:order-2"
                  >
                    {(isSaving || isUploading) && <Loader2 className="h-4 w-4 animate-spin" />}
                    {submitLabel}
                  </button>
                </div>
              </>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}

function ContentFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id) && id !== "new";

  const existing = trpc.content.getById.useQuery({ fileID: id! }, { enabled: isEditing });
  const employees = trpc.employee.list.useQuery({ employeePortalOnly: true });

  const [fileID, setFileID] = useState("");
  const [filename, setFilename] = useState("");
  const [url, setUrl] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [lastModified, setLastModified] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [contentType, setContentType] = useState("");
  const [documentStatus, setDocumentStatus] = useState("");

  const handleUploadSuccess = useCallback(
    (result: { publicUrl: string; storagePath: string; fileName: string }) => {
      setFilename(result.fileName.slice(0, 100));
      setUrl(result.publicUrl);
      setLastModified(new Date().toISOString().split("T")[0]);

      if (!isEditing && !fileID) {
        setFileID(result.storagePath.slice(0, 64));
      }
      if (!isEditing && !documentStatus) {
        setDocumentStatus("Created");
      }
    },
    [isEditing, fileID, documentStatus],
  );

  const { upload, isUploading, uploadProgress, uploadError } = useFileUpload({
    bucket: "content-files",
    onSuccess: handleUploadSuccess,
  });

  useEffect(() => {
    const d = existing.data;
    if (!d) return;
    setFileID(d.fileID);
    setFilename(d.filename ?? "");
    setUrl(d.url ?? "");
    setOwnerId(d.owner_id ?? "");
    setJobPosition(d.job_position ?? "");
    setLastModified(formatDateField(d.last_modified));
    setExpirationDate(formatDateField(d.expiration_date));
    setContentType(d.content_type ?? "");
    setDocumentStatus(d.document_status ?? "");
  }, [existing.data]);

  const utils = trpc.useUtils();

  const create = trpc.content.create.useMutation({
    onSuccess: () => {
      utils.content.list.invalidate();
      navigate("/hero/content");
    },
  });

  const update = trpc.content.update.useMutation({
    onSuccess: () => {
      utils.content.list.invalidate();
      utils.content.getById.invalidate({ fileID: id! });
      navigate("/hero/content");
    },
  });

  const isSaving = create.isPending || update.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = {
      filename: toNullable(filename),
      url: toNullable(url),
      owner_id: toNullable(ownerId),
      job_position: toNullable(jobPosition),
      last_modified: lastModified ? new Date(lastModified) : null,
      expiration_date: expirationDate ? new Date(expirationDate) : null,
      content_type: toNullable<"Reference" | "Workflow">(contentType as "Reference" | "Workflow"),
      document_status: toNullable<"Created" | "in-progress" | "Finalized" | "Archived">(
        documentStatus as "Created" | "in-progress" | "Finalized" | "Archived",
      ),
    };

    if (isEditing) {
      update.mutate({ fileID: id!, ...data });
    } else {
      create.mutate({ fileID, ...data });
    }
  }

  if (isEditing && existing.isLoading) {
    return (
      <div className="flex justify-center border-t border-border/60 py-16">
        <Loader2 className="h-6 w-6 animate-spin text-hanover-green" />
        <span className="ml-2 text-muted-foreground">Loading content...</span>
      </div>
    );
  }

  return (
    <ContentFormFields
      isEditing={isEditing}
      fileID={fileID}
      setFileID={setFileID}
      filename={filename}
      setFilename={setFilename}
      url={url}
      setUrl={setUrl}
      ownerId={ownerId}
      setOwnerId={setOwnerId}
      jobPosition={jobPosition}
      setJobPosition={setJobPosition}
      lastModified={lastModified}
      setLastModified={setLastModified}
      expirationDate={expirationDate}
      setExpirationDate={setExpirationDate}
      contentType={contentType}
      setContentType={setContentType}
      documentStatus={documentStatus}
      setDocumentStatus={setDocumentStatus}
      employees={employees.data}
      upload={upload}
      isUploading={isUploading}
      uploadProgress={uploadProgress}
      uploadError={uploadError}
      createError={create.error}
      updateError={update.error}
      isSaving={isSaving}
      onSubmit={handleSubmit}
    />
  );
}

export default ContentFormPage;
