"use client";

import { motion } from "framer-motion";
import React from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
}

export default function ScrollReveal({ children, className, delay = 0, yOffset = 30 }: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20, 
        delay 
      }}
    >
      {children}
    </motion.div>
  );
}
