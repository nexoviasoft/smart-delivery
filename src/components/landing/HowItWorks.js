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
              <div className="relative rounded-2xl bg-slate-900 p-6 h-80 overflow-hidden flex flex-col gap-4 border border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="h-4 w-24 bg-slate-800 rounded-full"></div>
                </div>

                {/* Content */}
                <div className="flex-1 flex gap-4">
                  {/* Sidebar */}
                  <div className="w-16 flex flex-col gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-8 w-8 rounded-lg bg-slate-800 opacity-50"></div>
                    ))}
                  </div>

                  {/* Main Area */}
                  <div className="flex-1 flex flex-col gap-4">
                    {/* Stats Row */}
                    <div className="flex gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 flex-1 rounded-xl bg-slate-800/50 p-3 flex flex-col justify-between">
                          <div className="h-2 w-8 bg-slate-700 rounded-full"></div>
                          <div className="h-4 w-12 bg-indigo-500/50 rounded-full"></div>
                        </div>
                      ))}
                    </div>

                    {/* Animated Order Rows */}
                    <div className="flex-1 rounded-xl bg-slate-800/30 p-4 flex flex-col gap-3 relative overflow-hidden">
                      <div className="h-2 w-16 bg-slate-700 rounded-full mb-2"></div>
                      
                      <motion.div
                        animate={{ y: [0, -40, -40, -80, -80, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="flex flex-col gap-3"
                      >
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-10 w-full rounded-lg bg-slate-800/80 flex items-center px-4 gap-4">
                            <div className="h-6 w-6 rounded-md bg-indigo-500/20 flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-indigo-400"></div>
                            </div>
                            <div className="flex-1 h-2 bg-slate-700 rounded-full"></div>
                            <div className="w-16 h-2 bg-slate-600 rounded-full"></div>
                            <div className="w-10 h-4 rounded-full bg-green-500/20 border border-green-500/30"></div>
                          </div>
                        ))}
                      </motion.div>

                      {/* Gradient fade for bottom */}
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900 to-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
