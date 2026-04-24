"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Integrations from "@/components/landing/Integrations";
import Pricing from "@/components/landing/Pricing";
import Support from "@/components/landing/Support";
import RegistrationForm from "@/components/landing/RegistrationForm";
import Footer from "@/components/landing/Footer";
import ScrollReveal from "@/components/landing/ScrollReveal";

export default function Home() {
  const [packages, setPackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [billingCycle, setBillingCycle] = useState("yearly");
  const [companySubmitting, setCompanySubmitting] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    companyEmail: "",
    phone: "",
    password: "",
  });

  const formRef = useRef(null);

  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndRedirect() {
      // Check super admin first
      const saToken = window.localStorage.getItem("super_admin_token");
      if (saToken === "hardcoded-super-admin-token") {
        router.replace("/super-admin/packages");
        return;
      }

      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const json = await res.json();
        if (res.ok && json.success) {
          // User is logged in, redirect to dashboard
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
    }
    checkAuthAndRedirect();

    async function loadPackages() {
      try {
        const res = await fetch("/api/packages");
        const json = await res.json();
        if (!res.ok) {
          setError(json?.message || "Package load failed");
        } else {
          setPackages(json?.packages || []);
        }
      } catch (err) {
        setError("Failed to connect to the server.");
      }
      setLoadingPackages(false);
    }
    loadPackages();
  }, [router]);

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
      setSuccess("Company registration successful.");
      setCompanyForm({
        companyName: "",
        companyEmail: "",
        phone: "",
        password: "",
      });
      setSelectedPackageId("");
    }
    setCompanySubmitting(false);
  }

  const handleSelectPackage = (pkgId) => {
    setSelectedPackageId(pkgId);
    setSuccess("");
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      <Navbar />

      <main>
        <Hero />
        <ScrollReveal delay={0.1}>
          <Features />
        </ScrollReveal>
        <ScrollReveal direction="left" delay={0.2}>
          <HowItWorks />
        </ScrollReveal>
        <ScrollReveal direction="right" delay={0.2}>
          <Integrations />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <Pricing
            packages={packages}
            loadingPackages={loadingPackages}
            billingCycle={billingCycle}
            setBillingCycle={setBillingCycle}
            handleSelectPackage={handleSelectPackage}
          />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <Support />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <RegistrationForm
            selectedPackageId={selectedPackageId}
            setSelectedPackageId={setSelectedPackageId}
            packages={packages}
            error={error}
            success={success}
            companySubmitting={companySubmitting}
            companyForm={companyForm}
            setCompanyForm={setCompanyForm}
            handleCompanyRegister={handleCompanyRegister}
            formRef={formRef}
          />
        </ScrollReveal>
      </main>

      <Footer />

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
