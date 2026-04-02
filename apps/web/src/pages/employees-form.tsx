import { TextInput } from "@myapp/ui/components/text-input";

function EmployeesFormPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="py-12">
        <div className="mx-auto max-w-[640px] px-4">
          <div className="rounded bg-white p-8 shadow-md">
            <form className="space-y-6">
              <TextInput label="First Name" type="text" />
              <TextInput label="Last Name" type="text" />
              <TextInput label="Email Address" type="email" />
              <TextInput label="Job Title" type="text" />
              <TextInput label="Department" type="text" />

              {/* Role — select element, not a text input */}
              <div>
                <label
                  htmlFor="role"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Role
                </label>
                <select
                  id="role"
                  className="w-full rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Underwriter">Underwriter</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <TextInput label="Employee ID" type="text" />
              <TextInput label="Start Date" type="date" />

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full rounded bg-[#4a6741] py-3 font-semibold text-white transition-colors hover:bg-[#3b5433]"
              >
                Save Employee
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeesFormPage;
