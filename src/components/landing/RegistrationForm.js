import React from "react";

const RegistrationForm = ({
  selectedPackageId,
  setSelectedPackageId,
  packages,
  error,
  success,
  companySubmitting,
  companyForm,
  setCompanyForm,
  handleCompanyRegister,
  formRef
}) => {
  return (
    <section
      ref={formRef}
      id="registration"
      className="mx-auto max-w-2xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8"
    >
      {selectedPackageId && (
        <div className="rounded-3xl border border-indigo-100 bg-white p-8 shadow-2xl shadow-indigo-50 sm:p-10" style={{ animation: 'slideUp 0.4s ease-out' }}>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Complete Your Registration</h2>
          <p className="mt-2 text-sm text-slate-500">You've selected the <span className="font-bold text-indigo-600">{packages.find(p => p._id === selectedPackageId)?.name}</span> plan.</p>

          {error && <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 ring-1 ring-red-100">{error}</div>}

          <form onSubmit={handleCompanyRegister} className="mt-8 space-y-4">
            {[
              { label: "Company Name", key: "companyName", type: "text" },
              { label: "Company Email", key: "companyEmail", type: "email" },
              { label: "Password", key: "password", type: "password" },
              { label: "Phone Number", key: "phone", type: "text" }
            ].map((field) => (
              <div key={field.key}>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50"
                  placeholder={field.label}
                  type={field.type}
                  value={companyForm[field.key]}
                  onChange={(e) => setCompanyForm(s => ({ ...s, [field.key]: e.target.value }))}
                  required
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
              disabled={companySubmitting}
            >
              {companySubmitting ? "Registering..." : "Get Started Now"}
            </button>
            <button
              type="button"
              className="w-full py-2 text-sm font-semibold text-slate-400 transition-colors hover:text-slate-600"
              onClick={() => setSelectedPackageId("")}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {success && (
        <div className="rounded-3xl border border-emerald-100 bg-white p-10 text-center shadow-2xl shadow-emerald-50">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-4xl text-emerald-500">🎉</div>
          <h2 className="mt-6 text-2xl font-bold text-slate-900">{success}</h2>
          <p className="mt-2 text-sm text-slate-500">Welcome to Smart Growth Manager. You can now log in to your dashboard.</p>
          <a href="/login" className="mt-8 block w-full rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700">Go to Login</a>
        </div>
      )}
    </section>
  );
};

export default RegistrationForm;
