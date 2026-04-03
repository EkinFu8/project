import { TextInput } from "@myapp/ui/components/text-input";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { trpc } from "@/lib/trpc";

function ContentFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id) && id !== "new";

  const existing = trpc.content.getById.useQuery({ id: id! }, { enabled: isEditing });

  const employees = trpc.employee.list.useQuery({});

  const [owner, setOwner] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [lastModifiedDate, setLastModifiedDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [contentType, setContentType] = useState("Reference");
  const [status, setStatus] = useState("Created");

  // Populate form when editing
  useEffect(() => {
    if (existing.data) {
      setOwner(existing.data.owner ?? "");
      setJobPosition(existing.data.job_position ?? "");
      setLastModifiedDate(existing.data.last_modified_date ?? "");
      setExpirationDate(existing.data.expiration_date ?? "");
      setContentType(existing.data.content_type ?? "Reference");
      setStatus(existing.data.status ?? "Created");
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
      utils.content.getById.invalidate({ id: id! });
      navigate("/content");
    },
  });

  const isSaving = create.isPending || update.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = {
      owner,
      job_position: jobPosition,
      last_modified_date: lastModifiedDate,
      expiration_date: expirationDate,
      content_type: contentType,
      status,
    };

    if (isEditing) {
      update.mutate({ id: id!, ...data });
    } else {
      create.mutate(data);
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
              <TextInput label="File" type="file" />

              <TextInput
                label="Owner"
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />

              <TextInput
                label="Job Position"
                type="text"
                value={jobPosition}
                onChange={(e) => setJobPosition(e.target.value)}
              />

              <TextInput
                label="Last modified date"
                type="date"
                value={lastModifiedDate}
                onChange={(e) => setLastModifiedDate(e.target.value)}
              />

              <TextInput
                label="Expiration date"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />

              {/* Content type — select element, not a text input */}
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
                  className="w-full rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Reference">Reference</option>
                  <option value="Workflow">Workflow</option>
                </select>
              </div>

              {/* Status — select element, not a text input */}
              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Created">Created</option>
                  <option value="in-progress">In Progress</option>
                  <option value="Finalized">Finalized</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* Error display */}
              {(create.isError || update.isError) && (
                <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {create.error?.message || update.error?.message || "Something went wrong."}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-2 rounded bg-[#4a6741] py-3 font-semibold text-white transition-colors hover:bg-[#3b5433] disabled:opacity-60"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? "Update Content" : "Save Content"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentFormPage;
