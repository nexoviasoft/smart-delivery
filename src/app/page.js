"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [packages, setPackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdCompanyId, setCreatedCompanyId] = useState("");
  const [companySubmitting, setCompanySubmitting] = useState(false);
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    slug: "",
    companyEmail: "",
    ownerName: "",
    ownerEmail: "",
    password: "",
    billingType: "monthly",
  });
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });

  useEffect(() => {
    async function loadPackages() {
      const res = await fetch("/api/packages");
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Package load failed");
      } else {
        const list = json?.data || [];
        setPackages(list);
        if (list.length > 0) {
          setSelectedPackageId(list[0]._id);
        }
      }
      setLoadingPackages(false);
    }
    loadPackages();
  }, []);

  async function handleCompanyRegister(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setCompanySubmitting(true);

    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...companyForm,
        packageId: selectedPackageId,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json?.error || "Company registration failed");
    } else {
      setCreatedCompanyId(json?.data?.company?._id || "");
      setSuccess("Company registration successful. Owner user created.");
    }
    setCompanySubmitting(false);
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    if (!createdCompanyId) {
      setError("First register a company");
      return;
    }
    setError("");
    setSuccess("");
    setUserSubmitting(true);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-company-id": createdCompanyId,
      },
      body: JSON.stringify(userForm),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json?.error || "User create failed");
    } else {
      setSuccess("User created successfully.");
      setUserForm({ name: "", email: "", password: "", role: "staff" });
    }
    setUserSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section>
          <h1 className="text-3xl font-semibold">Smart Growth Manager</h1>
          <p className="mt-2 text-zinc-600">
            Choose a package, register your company, then create users.
          </p>
        </section>

        {error && <p className="rounded border border-red-200 bg-red-50 p-3">{error}</p>}
        {success && (
          <p className="rounded border border-emerald-200 bg-emerald-50 p-3">{success}</p>
        )}

        <section className="rounded border bg-white p-5">
          <h2 className="text-xl font-semibold">Packages</h2>
          {loadingPackages && <p className="mt-3 text-sm text-zinc-500">Loading packages...</p>}
          {!loadingPackages && packages.length === 0 && (
            <p className="mt-3 text-sm text-zinc-500">No package found.</p>
          )}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {packages.map((pkg) => (
              <button
                key={pkg._id}
                className={`rounded border p-4 text-left ${
                  selectedPackageId === pkg._id
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white"
                }`}
                onClick={() => setSelectedPackageId(pkg._id)}
              >
                <p className="font-semibold">{pkg.name}</p>
                <p className="text-sm">
                  Monthly: {pkg.priceMonthly} | Yearly: {pkg.priceYearly}
                </p>
                <p className="mt-2 text-xs">Users limit: {pkg?.limits?.users}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <form className="rounded border bg-white p-5" onSubmit={handleCompanyRegister}>
            <h2 className="text-xl font-semibold">Company Registration</h2>
            <div className="mt-4 grid gap-3">
              <input
                className="rounded border p-2"
                placeholder="Company Name"
                value={companyForm.companyName}
                onChange={(e) =>
                  setCompanyForm((state) => ({ ...state, companyName: e.target.value }))
                }
                required
              />
              <input
                className="rounded border p-2"
                placeholder="Company Slug"
                value={companyForm.slug}
                onChange={(e) =>
                  setCompanyForm((state) => ({ ...state, slug: e.target.value }))
                }
                required
              />
              <input
                className="rounded border p-2"
                placeholder="Company Email"
                type="email"
                value={companyForm.companyEmail}
                onChange={(e) =>
                  setCompanyForm((state) => ({ ...state, companyEmail: e.target.value }))
                }
                required
              />
              <input
                className="rounded border p-2"
                placeholder="Owner Name"
                value={companyForm.ownerName}
                onChange={(e) =>
                  setCompanyForm((state) => ({ ...state, ownerName: e.target.value }))
                }
                required
              />
              <input
                className="rounded border p-2"
                placeholder="Owner Email"
                type="email"
                value={companyForm.ownerEmail}
                onChange={(e) =>
                  setCompanyForm((state) => ({ ...state, ownerEmail: e.target.value }))
                }
                required
              />
              <input
                className="rounded border p-2"
                placeholder="Owner Password"
                type="password"
                value={companyForm.password}
                onChange={(e) =>
                  setCompanyForm((state) => ({ ...state, password: e.target.value }))
                }
                required
              />
              <select
                className="rounded border p-2"
                value={companyForm.billingType}
                onChange={(e) =>
                  setCompanyForm((state) => ({ ...state, billingType: e.target.value }))
                }
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <button
                type="submit"
                className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
                disabled={!selectedPackageId || companySubmitting}
              >
                {companySubmitting ? "Registering..." : "Register Company"}
              </button>
            </div>
          </form>

          <form className="rounded border bg-white p-5" onSubmit={handleCreateUser}>
            <h2 className="text-xl font-semibold">Create User</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Company ID: {createdCompanyId || "Register company first"}
            </p>
            <div className="mt-4 grid gap-3">
              <input
                className="rounded border p-2"
                placeholder="User Name"
                value={userForm.name}
                onChange={(e) =>
                  setUserForm((state) => ({ ...state, name: e.target.value }))
                }
                required
              />
              <input
                className="rounded border p-2"
                placeholder="User Email"
                type="email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm((state) => ({ ...state, email: e.target.value }))
                }
                required
              />
              <input
                className="rounded border p-2"
                placeholder="Password"
                type="password"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm((state) => ({ ...state, password: e.target.value }))
                }
                required
              />
              <select
                className="rounded border p-2"
                value={userForm.role}
                onChange={(e) =>
                  setUserForm((state) => ({ ...state, role: e.target.value }))
                }
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
              <button
                type="submit"
                className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
                disabled={!createdCompanyId || userSubmitting}
              >
                {userSubmitting ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
