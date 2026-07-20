"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import React, { useRef } from "react";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 }
  }
};

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerContainer({ children, className }: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "100px" }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 95%", "start 75%"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 300, damping: 30 });
  
  const opacity = useTransform(smoothProgress, [0, 1], [0, 1]);
  const y = useTransform(smoothProgress, [0, 1], [40, 0]);
  const scale = useTransform(smoothProgress, [0, 1], [0.95, 1]);

  return (
    <motion.div 
      ref={ref}
      className={className} 
      style={{ opacity, y, scale }}
    >
      {children}
    </motion.div>
  );
}
