import { TextInput } from "@myapp/ui/components/text-input";

function ContentFormPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="py-12">
        <div className="mx-auto max-w-[640px] px-4">
          <div className="rounded bg-white p-8 shadow-md">
            <form className="space-y-6">
              <TextInput label="File" type="file" />
              <TextInput label="Owner" type="text" />
              <TextInput label="Job Position" type="text" />
              <TextInput label="Last modified date" type="date" />
              <TextInput label="Expiration date" type="date" />

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
                  className="w-full rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Created">Created</option>
                  <option value="in-progress">In Progress</option>
                  <option value="Finalized">Finalized</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full rounded bg-[#4a6741] py-3 font-semibold text-white transition-colors hover:bg-[#3b5433]"
              >
                Save Content
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentFormPage;
