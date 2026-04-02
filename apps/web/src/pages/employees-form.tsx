function EmployeesFormPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="py-12">
        <div className="mx-auto max-w-[640px] px-4">
          <div className="rounded bg-white p-8 shadow-md">
            <form className="space-y-6">
              {/* First Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Last Name
                </label>
                <input
                  type="text"
                  className="w-full rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Job Title */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Job Title
                </label>
                <input
                  type="text"
                  className="w-full rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Department */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Department
                </label>
                <input
                  type="text"
                  className="w-full rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Role */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Role
                </label>
                <select className="w-full rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="Underwriter">Underwriter</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {/* Employee ID */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Employee ID
                </label>
                <input
                  type="text"
                  className="w-full rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

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
