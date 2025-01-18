"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  IconBrain,
  IconGift,
  IconTruck,
  IconCalendarTime,
  IconUserCheck,
  IconPackage,
  IconAward,
  IconHeartHandshake,
} from "@tabler/icons-react";

export function HowItWorks() {
  const features = [
    {
      title: "Smart Profiling",
      description: "AI-powered questionnaires learn about your gift recipient's preferences and interests",
      icon: <IconBrain className="w-6 h-6" />,
    },
    {
      title: "AI Gift Matching",
      description: "Advanced algorithms suggest perfect gifts based on recipient profiles and success patterns",
      icon: <IconGift className="w-6 h-6" />,
    },
    {
      title: "Expert Curation",
      description: "Human experts review and refine AI suggestions to ensure the perfect selection",
      icon: <IconUserCheck className="w-6 h-6" />,
    },
    {
      title: "Premium Packaging",
      description: "Each gift is beautifully wrapped with premium materials and presentation",
      icon: <IconPackage className="w-6 h-6" />,
    },
    {
      title: "Quality Assured",
      description: "Rigorous quality control ensures every gift meets our high standards",
      icon: <IconAward className="w-6 h-6" />,
    },
    {
      title: "Timely Delivery",
      description: "Scheduled delivery ensures your gifts arrive right when they're needed",
      icon: <IconTruck className="w-6 h-6" />,
    },
    {
      title: "Gift Scheduling",
      description: "Plan ahead with automated gift scheduling and reminders",
      icon: <IconCalendarTime className="w-6 h-6" />,
    },
    {
      title: "Personal Touch",
      description: "Every gift combines AI efficiency with genuine human thoughtfulness",
      icon: <IconHeartHandshake className="w-6 h-6" />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0.0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.3,
        duration: 0.8,
        ease: "easeInOut",
      }}
      className="py-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold dark:text-white text-black mb-4 font-heading">
            How It Works
          </h2>
          <p className="text-lg dark:text-neutral-200 text-neutral-800 mb-12 font-body">
            AI-Powered Gifting with a Human Touch
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800
                ${(index === 0 || index === 4) && "lg:border-l dark:border-neutral-800"}
                ${index < 4 && "lg:border-b dark:border-neutral-800"}`}
            >
              {index < 4 && (
                <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
              )}
              {index >= 4 && (
                <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
              )}
              <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
                {feature.icon}
              </div>
              <div className="text-lg font-bold mb-2 relative z-10 px-10">
                <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
                <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100 font-heading">
                  {feature.title}
                </span>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10 font-body">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
} 