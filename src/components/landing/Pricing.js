"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckIcon, FlameIcon } from "./Icons";

const Pricing = ({ 
  packages, 
  loadingPackages, 
  billingCycle, 
  setBillingCycle, 
  handleSelectPackage 
}) => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }
    }
  };

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-base font-bold uppercase tracking-widest text-indigo-600"
        >
          Pricing
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl"
        >
          Plans for every stage of growth
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 flex flex-col items-center"
        >
          <div
            className="relative flex w-44 cursor-pointer rounded-full bg-slate-200 p-1 transition-all"
            onClick={() => setBillingCycle(billingCycle === 'yearly' ? 'monthly' : 'yearly')}
          >
            <div
              className={`absolute h-8 w-[calc(50%-4px)] rounded-full bg-slate-900 transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-[calc(100%)]' : 'translate-x-0'}`}
            ></div>
            <button className={`relative z-10 flex-1 py-1 text-xs font-bold transition-colors ${billingCycle === 'yearly' ? 'text-slate-500' : 'text-white'}`}>Monthly</button>
            <button className={`relative z-10 flex-1 py-1 text-xs font-bold transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-500'}`}>Yearly</button>
          </div>
        </motion.div>
      </div>

      {loadingPackages ? (
        <div className="py-20 text-center text-slate-500">Loading packages...</div>
      ) : packages.length === 0 ? (
        <div className="py-20 text-center text-slate-500">No packages available.</div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {packages.map((pkg) => {
            const isPopular = pkg.name.toLowerCase().includes("pro");
            const price = billingCycle === "yearly" ? pkg.priceYearly : pkg.priceMonthly;
            const billingLabel = billingCycle === "yearly" ? "/yr" : "/mo";

            return (
              <motion.div
                key={pkg._id}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`relative flex flex-col rounded-3xl border bg-white p-8 transition-shadow hover:shadow-2xl ${isPopular ? 'border-2 border-indigo-600 ring-4 ring-indigo-50' : 'border-slate-200 shadow-lg shadow-slate-100'}`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 left-0 flex -translate-y-1/2 items-center justify-center">
                    <span className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                      <FlameIcon /> Popular choice
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                    {price === 0 ? "Custom" : `€${price}`}
                  </span>
                  {price !== 0 && <span className="text-sm font-medium text-slate-500">{billingLabel}</span>}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {price === 0 ? "Contact Sales for Pricing." : `per user / billed ${billingCycle}`}
                </p>

                <ul className="mt-8 flex-1 space-y-4">
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckIcon /> Access Smart Growth Manager dashboard
                  </li>
                  {Object.entries(pkg.features || {})
                    .filter(([, enabled]) => enabled)
                    .map(([feature]) => {
                      let name = feature.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                      if (name === "Wp Promotion") name = "WhatsApp Promotion";
                      return (
                        <li key={feature} className="flex items-center gap-3 text-sm text-slate-600">
                          <CheckIcon /> {name}
                        </li>
                      );
                    })}
                  
                  {/* Package Limits */}
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckIcon /> {pkg.limits?.users?.toLocaleString() || 0} User license
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckIcon /> {pkg.limits?.orders_per_month?.toLocaleString() || 0} Orders / mo
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckIcon /> {pkg.limits?.courier_orders_per_month?.toLocaleString() || 0} Courier orders / mo
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckIcon /> {pkg.limits?.emails_per_month?.toLocaleString() || 0} Emails / mo
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckIcon /> {pkg.limits?.campaigns_per_month?.toLocaleString() || 0} Campaigns / mo
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckIcon /> {pkg.limits?.wp_promotions_per_month?.toLocaleString() || 0} WhatsApp promos / mo
                  </li>
                </ul>

                <button
                  className={`mt-8 w-full rounded-xl py-3 text-sm font-bold transition-all ${price === 0 ? 'bg-slate-900 text-white hover:bg-black' : isPopular ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  onClick={() => handleSelectPackage(pkg._id)}
                >
                  {price === 0 ? "Contact Sales" : "Buy now"}
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </section>
  );
};

export default Pricing;
