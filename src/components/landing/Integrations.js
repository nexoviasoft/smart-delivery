"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckIcon } from "./Icons";

const Integrations = () => {
  const integrations = [
    { name: "Steadfast Courier", desc: "Native API integration for seamless delivery processing.", icon: "🚛" },
    { name: "Email Automation", desc: "Advanced campaign management and customer follow-ups.", icon: "✉️" },
    { name: "WhatsApp", desc: "Automated customer updates and marketing via WhatsApp.", icon: "📱" },
    { name: "Ad Campaigns", desc: "Collect leads directly from Facebook, Instagram, and Google Ads.", icon: "🚀" }
  ];

  return (
    <section id="integrations" className="py-24 bg-white overflow-hidden border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {integrations.map((int, index) => (
                <motion.div 
                  key={int.name} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:border-indigo-100 transition-all hover:shadow-lg"
                >
                  <div className="text-3xl mb-4">{int.icon}</div>
                  <h4 className="font-bold text-slate-900 mb-1">{int.name}</h4>
                  <p className="text-xs text-slate-500">{int.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-base font-bold uppercase tracking-widest text-indigo-600"
            >
              For Every Business
            </motion.h2>
            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-4xl font-extrabold text-slate-900 leading-tight"
            >
              Tailored for EdTech, E-commerce & Lead Gen
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg text-slate-600 leading-relaxed"
            >
              Smart Growth Manager sits at the center of your business ecosystem. Whether you're managing students in EdTech, orders in E-commerce, or leads for any business, we bridge the gap between your sales channels and fulfillment, ensuring data flows smoothly without manual effort.
            </motion.p>
            <ul className="mt-8 space-y-4">
              {[
                "Unified dashboard for EdTech & E-commerce leads",
                "Deep integration with courier & LMS APIs",
                "Automated student & customer engagement",
                "Real-time lead-to-conversion tracking"
              ].map((item, index) => (
                <motion.li 
                  key={item} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
                  className="flex items-center gap-3 text-slate-700 font-medium"
                >
                  <div className="rounded-full bg-indigo-100 p-1 text-indigo-600">
                    <CheckIcon />
                  </div>
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integrations;
