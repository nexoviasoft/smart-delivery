"use client";

import React from "react";
import { motion } from "framer-motion";

const HowItWorks = () => {
  const steps = [
    { step: "01", title: "Collect Leads", desc: "Create campaigns to collect customer data and orders." },
    { step: "02", title: "Connect Store", desc: "Link your WooCommerce or custom store via API." },
    { step: "03", title: "Automate Shipping", desc: "Orders are automatically pushed to your couriers." },
    { step: "04", title: "Nurture & Grow", desc: "Build lasting relationships with automated sequences and scale your business." }
  ];

  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="lg:flex lg:items-center lg:gap-24">
          <div className="lg:w-1/2">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-extrabold sm:text-4xl"
            >
              Simplify Your Workflow
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-lg text-slate-400"
            >
              Say goodbye to manual data entry. Connect your store and let Smart Growth Manager handle the rest.
            </motion.p>
            <div className="mt-10 space-y-8">
              {steps.map((item, index) => (
                <motion.div 
                  key={item.step} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  className="flex gap-6"
                >
                  <div className="text-2xl font-black text-indigo-500">{item.step}</div>
                  <div>
                    <h4 className="text-xl font-bold">{item.title}</h4>
                    <p className="mt-1 text-slate-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="mt-16 lg:mt-0 lg:w-1/2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative rounded-3xl bg-slate-800 p-2 shadow-2xl ring-1 ring-slate-700"
            >
              <div className="rounded-2xl bg-slate-900 p-8 h-80 flex items-center justify-center text-slate-500 font-mono italic text-center">
                [ Dashboard Mockup: Real-time Order Flow ]
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
