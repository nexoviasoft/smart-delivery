"use client";

import React from "react";
import { motion } from "framer-motion";

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
    },
  };

  return (
    <section className="relative overflow-hidden pt-20 pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-7xl"
            variants={itemVariants}
          >
            Automate Your Delivery<br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Scale Your Growth.</span>
          </motion.h1>
          
          <motion.p 
            className="mx-auto mt-6 max-w-2xl text-xl text-slate-600"
            variants={itemVariants}
          >
            The all-in-one platform for bulk courier automation, real-time tracking, and multi-channel marketing.
          </motion.p>
          
          <motion.div 
            className="mt-10 flex items-center justify-center gap-x-6"
            variants={itemVariants}
          >
            <a href="#pricing" className="rounded-full bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:-translate-y-0.5">
              Explore Packages
            </a>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Background Decor */}
      <motion.div 
        className="absolute top-0 -z-10 h-full w-full opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-200 blur-[120px]"></div>
      </motion.div>
    </section>
  );
};

export default Hero;
