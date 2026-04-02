import { TextInput } from "@myapp/ui/components/text-input";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { trpc } from "@/lib/trpc";

function EmployeesFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id) && id !== "new";

  const existing = trpc.employee.getById.useQuery({ id: id! }, { enabled: isEditing });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [hiredAt, setHiredAt] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (existing.data) {
      setName(existing.data.name);
      setEmail(existing.data.email);
      setTitle(existing.data.title ?? "");
      setDepartment(existing.data.department ?? "");
      setPhone(existing.data.phone ?? "");
      setHiredAt(
        existing.data.hired_at ? new Date(existing.data.hired_at).toISOString().split("T")[0] : "",
      );
    }
  }, [existing.data]);

  const utils = trpc.useUtils();

  const create = trpc.employee.create.useMutation({
    onSuccess: () => {
      utils.employee.list.invalidate();
      navigate("/employees");
    },
  });

  const update = trpc.employee.update.useMutation({
    onSuccess: () => {
      utils.employee.list.invalidate();
      utils.employee.getById.invalidate({ id: id! });
      navigate("/employees");
    },
  });

  const isSaving = create.isPending || update.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = {
      name,
      email,
      title: title || null,
      department: department || null,
      phone: phone || null,
      hired_at: hiredAt ? new Date(hiredAt) : null,
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
        <span className="ml-2 text-muted-foreground">Loading employee...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="py-12">
        <div className="mx-auto max-w-[640px] px-4">
          <Link
            to="/employees"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </Link>

          <h1 className="mb-6 text-2xl font-bold text-foreground">
            {isEditing ? "Edit Employee" : "Add New Employee"}
          </h1>

          <div className="rounded bg-white p-8 shadow-md">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <TextInput
                label="Full Name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextInput
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextInput
                label="Job Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <TextInput
                label="Department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
              <TextInput
                label="Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <TextInput
                label="Hire Date"
                type="date"
                value={hiredAt}
                onChange={(e) => setHiredAt(e.target.value)}
              />

              {/* Error display */}
              {(create.isError || update.isError) && (
                <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {create.error?.message || update.error?.message || "Something went wrong."}
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-2 rounded bg-hanover-green py-3 font-semibold text-white transition-colors hover:bg-hanover-green/90 disabled:opacity-60"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? "Update Employee" : "Save Employee"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeesFormPage;
