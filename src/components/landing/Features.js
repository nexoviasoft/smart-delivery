"use client";

import React from "react";
import { motion } from "framer-motion";

const Features = () => {
  const features = [
    {
      title: "Campaign Lead Collection",
      desc: "Create high-converting landing pages and collect leads directly into your dashboard.",
      icon: "🎯"
    },
    {
      title: "Courier Automation",
      desc: "Automatically sync orders with Steadfast Courier and other major providers.",
      icon: "🚚"
    },
    {
      title: "Bulk Order Management",
      desc: "Process hundreds of orders in seconds with our powerful bulk action tools.",
      icon: "📦"
    },
    {
      title: "Email Automation",
      desc: "Send personalized follow-ups and marketing campaigns to boost retention.",
      icon: "📧"
    },
    {
      title: "WhatsApp Automation",
      desc: "Automate your WhatsApp marketing with our native plugin.",
      icon: "📱"
    },
    {
      title: "Real-time Tracking",
      desc: "Keep your customers updated with live delivery status notifications.",
      icon: "📍"
    },
    {
      title: "Advanced Analytics",
      desc: "Get deep insights into your delivery performance and growth metrics.",
      icon: "📊"
    },
    {
      title: "Smart Retargeting",
      desc: "Automatically re-engage customers who haven't purchased in a while.",
      icon: "🔄"
    },
    {
      title: "Lead Nurturing",
      desc: "Build lasting relationships with automated drip sequences across all channels.",
      icon: "🌱"
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section id="features" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base font-bold uppercase tracking-widest text-indigo-600"
          >
            Features
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl"
          >
            Everything you need to ship smarter
          </motion.p>
        </div>
        <motion.div 
          className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => (
            <motion.div 
              key={feature.title} 
              variants={itemVariants}
              className="group relative rounded-3xl border border-slate-100 p-8 transition-all hover:border-indigo-100 hover:bg-slate-50"
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-slate-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
