import { FileUpload } from "@myapp/ui/components/file-upload";
import { TextInput } from "@myapp/ui/components/text-input";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc.ts";

function ContentFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id) && id !== "new";

  const existing = trpc.content.getById.useQuery({ fileID: id! }, { enabled: isEditing });
  const employees = trpc.employee.list.useQuery({});

  const [fileID, setFileID] = useState("");
  const [filename, setFilename] = useState("");
  const [url, setUrl] = useState("");
  const [contentOwner, setContentOwner] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [lastModified, setLastModified] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [contentType, setContentType] = useState("");
  const [documentStatus, setDocumentStatus] = useState("");

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (existing.data) {
      setFileID(existing.data.fileID);
      setFilename(existing.data.filename ?? "");
      setUrl(existing.data.url ?? "");
      setContentOwner(existing.data.content_owner ?? "");
      setJobPosition(existing.data.job_position ?? "");
      setLastModified(
        existing.data.last_modified
          ? new Date(existing.data.last_modified).toISOString().split("T")[0]
          : "",
      );
      setExpirationDate(
        existing.data.expiration_date
          ? new Date(existing.data.expiration_date).toISOString().split("T")[0]
          : "",
      );
      setContentType(existing.data.content_type ?? "");
      setDocumentStatus(existing.data.document_status ?? "");
    }
  }, [existing.data]);

  const utils = trpc.useUtils();

  const create = trpc.content.create.useMutation({
    onSuccess: () => {
      utils.content.list.invalidate();
      navigate("/content");
    },
  });

  const update = trpc.content.update.useMutation({
    onSuccess: () => {
      utils.content.list.invalidate();
      utils.content.getById.invalidate({ fileID: id! });
      navigate("/content");
    },
  });

  const isSaving = create.isPending || update.isPending;

  const handleFileSelect = useCallback(
    async (file: File) => {
      setUploadError(null);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Build a unique storage path: timestamp-originalname
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const storagePath = `${timestamp}-${safeName}`;

        // Simulate incremental progress (Supabase JS SDK doesn't expose XHR progress)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const { error } = await supabase.storage
          .from("content-files")
          .upload(storagePath, file, { upsert: false });

        clearInterval(progressInterval);

        if (error) {
          setUploadError(error.message);
          setIsUploading(false);
          setUploadProgress(0);
          return;
        }

        // Get the public URL for the uploaded file
        const { data: publicUrlData } = supabase.storage
          .from("content-files")
          .getPublicUrl(storagePath);

        setUploadProgress(100);

        // Auto-fill the filename and URL fields
        setFilename(file.name.slice(0, 100));
        setUrl(publicUrlData.publicUrl);

        // Set last_modified to today
        setLastModified(new Date().toISOString().split("T")[0]);

        // If creating and no fileID yet, generate one from the storage path
        if (!isEditing && !fileID) {
          setFileID(storagePath.slice(0, 64));
        }

        // Mark status as Created for new content
        if (!isEditing && !documentStatus) {
          setDocumentStatus("Created");
        }

        setTimeout(() => {
          setIsUploading(false);
        }, 400);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [isEditing, fileID, documentStatus],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = {
      filename: filename || null,
      url: url || null,
      content_owner: contentOwner || null,
      job_position: jobPosition || null,
      last_modified: lastModified ? new Date(lastModified) : null,
      expiration_date: expirationDate ? new Date(expirationDate) : null,
      content_type: (contentType || null) as "Reference" | "Workflow" | null,
      document_status: (documentStatus || null) as
        | "Created"
        | "in-progress"
        | "Finalized"
        | "Archived"
        | null,
    };

    if (isEditing) {
      update.mutate({ fileID: id!, ...data });
    } else {
      create.mutate({ fileID, ...data });
    }
  }

  if (isEditing && existing.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5]">
        <Loader2 className="h-6 w-6 animate-spin text-hanover-green" />
        <span className="ml-2 text-muted-foreground">Loading content...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="py-12">
        <div className="mx-auto max-w-[640px] px-4">
          <Link
            to="/content"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Content
          </Link>

          <h1 className="mb-6 text-2xl font-bold text-foreground">
            {isEditing ? "Edit Content" : "New Content"}
          </h1>

          <div className="rounded bg-white p-8 shadow-md">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* File Upload */}
              <FileUpload
                label="Upload File"
                onFileSelect={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.gif,.svg"
                isUploading={isUploading}
                progress={uploadProgress}
                currentFileName={url ? filename : undefined}
                disabled={isSaving}
              />

              {uploadError && (
                <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Upload failed: {uploadError}
                </div>
              )}

              {url && (
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
              )}

              <hr className="border-border" />

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
                  value={contentOwner}
                  onChange={(e) => setContentOwner(e.target.value)}
                  className="w-full rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-hanover-green"
                >
                  <option value="">Unassigned</option>
                  {employees.data?.map((emp) => (
                    <option key={emp.employeeID} value={emp.employeeID}>
                      {emp.employee_name ?? emp.employeeID}
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
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
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

              {(create.isError || update.isError) && (
                <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {create.error?.message || update.error?.message || "Something went wrong."}
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="flex w-full items-center justify-center gap-2 rounded bg-hanover-green py-3 font-semibold text-white transition-colors hover:bg-hanover-green/90 disabled:opacity-60"
              >
                {(isSaving || isUploading) && <Loader2 className="h-4 w-4 animate-spin" />}
                {isUploading
                  ? "Uploading..."
                  : isEditing
                    ? "Update Content"
                    : "Save Content"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentFormPage;
