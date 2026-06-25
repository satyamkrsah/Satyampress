import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ClipboardList, CheckCircle2, Printer, Truck } from 'lucide-react';
import { orderSteps } from '../data/homeData';

const stepIcons = [Mail, ClipboardList, CheckCircle2, Printer, Truck];

const ProcessSteps = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-12 md:py-16 bg-[#fffdfa] dark:bg-background-dark transition-colors duration-300">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <p className="text-[#822f32] tracking-[0.3em] text-xs sm:text-sm uppercase mb-4 font-medium">How It Works</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-black dark:text-white mb-6">Your Order In Just Five Steps</h2>
          <div className="w-16 md:w-24 h-[2px] bg-[#822f32] mx-auto mb-6" />
          <p className="text-black/70 dark:text-white/70 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            From consultation to delivery, we craft your perfect prints with care and precision.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-8 md:gap-4 mb-10">
          {orderSteps.map((step, index) => {
            const Icon = stepIcons[index];
            const isActive = activeStep === index;
            
            return (
              <button
                key={step.step}
                onClick={() => setActiveStep(index)}
                className="flex flex-col items-center group w-full md:w-1/5 focus:outline-none"
              >
                {/* Step Circle Container */}
                <div className="relative mb-4">
                  {/* Step Circle */}
                  <div className={`w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all duration-300 bg-white dark:bg-[#1a1a1a] ${
                    isActive ? 'border-[1.5px] border-[#822f32] shadow-sm' : 'border border-[#822f32]/40 hover:border-[#822f32]/80'
                  }`}>
                    <Icon className={`w-10 h-10 md:w-12 md:h-12 transition-colors duration-300 ${
                      isActive ? 'text-[#822f32]' : 'text-[#822f32]/70 group-hover:text-[#822f32]'
                    }`} strokeWidth={1} />
                  </div>
                  
                  {/* Number Badge */}
                  <div className="absolute top-1 right-1 md:top-1 md:right-1 w-7 h-7 md:w-9 md:h-9 rounded-full bg-[#822f32] text-white flex items-center justify-center text-xs md:text-sm font-medium shadow-sm">
                    {step.step}
                  </div>
                </div>
                
                <h3 className={`text-sm md:text-base font-medium tracking-wide transition-colors duration-300 ${
                  isActive ? 'text-black dark:text-white' : 'text-black/80 dark:text-white/80 group-hover:text-black'
                }`}>
                  {step.title}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-3 mb-10">
          {orderSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeStep === index ? 'bg-[#822f32] scale-110' : 'bg-[#ebdcd1] hover:bg-[#d8c3b3]'
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Content Box */}
        <div className="bg-[#fdfbf7] dark:bg-[#151515] p-6 md:p-8 rounded-xl border border-[#ebdcd1] dark:border-white/10 shadow-sm max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col md:flex-row gap-5 items-start md:items-center"
            >
              <div className="flex-shrink-0">
                {React.createElement(stepIcons[activeStep], { 
                  className: "w-8 h-8 md:w-10 md:h-10 text-[#822f32]", 
                  strokeWidth: 1.5 
                })}
              </div>
              <div className="flex flex-col gap-1 md:gap-2">
                <h3 className="text-lg md:text-xl font-medium tracking-wide text-black dark:text-white">
                  {orderSteps[activeStep].title}
                </h3>
                <p className="text-black/70 dark:text-white/70 leading-relaxed text-sm md:text-base">
                  {orderSteps[activeStep].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;
