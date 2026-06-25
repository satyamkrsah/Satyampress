import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderSteps } from '../data/homeData';

const ProcessSteps = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-black transition-colors duration-300">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="text-center mb-14">
          <p className="section-subheading mb-3">How It Works</p>
          <h2 className="section-heading mb-4">Your Order In Just Five Steps</h2>
          <p className="text-black dark:text-white max-w-xl mx-auto">
            From consultation to delivery, we craft your perfect prints with care.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
          {orderSteps.map((step, index) => (
            <button
              key={step.step}
              onClick={() => setActiveStep(index)}
              className={`flex flex-col items-center px-4 py-3 transition-all duration-300 ${
                activeStep === index
                  ? 'text-gold'
                  : 'text-black dark:text-white hover:text-black dark:text-cream-dark'
              }`}
            >
              <span className={`text-2xl font-serif font-bold mb-1 ${activeStep === index ? 'text-gold' : 'text-black dark:text-cream-dark'}`}>
                {step.step}
              </span>
              <span className="text-xs md:text-sm font-medium whitespace-nowrap">{step.title}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h3 className="text-xl md:text-2xl font-serif font-semibold text-black dark:text-cream-dark mb-4">
              {orderSteps[activeStep].title}
            </h3>
            <p className="text-black dark:text-white leading-relaxed">
              {orderSteps[activeStep].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ProcessSteps;
