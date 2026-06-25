import React, { useState } from 'react';
import { Package, CheckCircle, Clock, Truck, FileText, PenTool, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    if (orderId.trim()) setIsTracking(true);
  };

  const steps = [
    { title: 'Order Received', icon: <FileText className="h-5 w-5" />, date: 'Oct 24, 2026', time: '10:30 AM', status: 'completed' },
    { title: 'Designing', icon: <PenTool className="h-5 w-5" />, date: 'Oct 25, 2026', time: '02:15 PM', status: 'completed' },
    { title: 'Printing', icon: <Package className="h-5 w-5" />, date: 'Oct 26, 2026', time: '09:00 AM', status: 'active' },
    { title: 'Packaging', icon: <Package className="h-5 w-5" />, date: 'Pending', time: '', status: 'upcoming' },
    { title: 'Ready For Delivery', icon: <Truck className="h-5 w-5" />, date: 'Pending', time: '', status: 'upcoming' },
    { title: 'Delivered', icon: <CheckCircle className="h-5 w-5" />, date: 'Pending', time: '', status: 'upcoming' },
  ];

  return (
    <div className="bg-white dark:bg-background-dark transition-colors duration-300 min-h-screen py-10 md:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="section-subheading mb-2">Order Status</p>
          <h1 className="section-heading mb-3">Track Your Order</h1>
          <p className="text-black dark:text-white text-sm">
            Enter your order ID to see the current status of your printing job.
          </p>
        </div>

        <div className="bg-white dark:bg-background-dark transition-colors duration-300 p-6 md:p-8 border border-black dark:border-white dark:border-black dark:border-white transition-colors duration-300 mb-10">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Enter Order ID (e.g., SPP-12345)"
              className="flex-grow px-4 py-3 bg-white dark:bg-background-dark transition-colors duration-300 border border-black dark:border-white dark:border-black dark:border-white transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-gold text-black dark:text-cream-dark"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary whitespace-nowrap h-12 sm:h-auto">
              Track Order
            </button>
          </form>
        </div>

        {isTracking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-background-dark transition-colors duration-300 p-6 md:p-10 border border-black dark:border-white dark:border-black dark:border-white transition-colors duration-300"
          >
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-black dark:border-white dark:border-black dark:border-white transition-colors duration-300">
              <div>
                <span className="text-xs uppercase tracking-wider text-black dark:text-white block mb-1">Order ID</span>
                <span className="text-xl font-serif font-semibold text-black dark:text-cream-dark">{orderId}</span>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-black dark:text-white block mb-1">Est. Delivery</span>
                <span className="text-lg font-semibold text-gold">Oct 28, 2026</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-[27px] top-4 bottom-4 w-px bg-white dark:bg-black" />

              <div className="space-y-8 relative z-10">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-6 items-start">
                    <div
                      className={`h-14 w-14 shrink-0 flex items-center justify-center border-4 border-white relative z-10 ${
                        step.status === 'completed'
                          ? 'bg-black text-white'
                          : step.status === 'active'
                            ? 'bg-gold/20 text-gold border-gold/30'
                            : 'bg-white dark:bg-black text-black dark:text-white'
                      }`}
                    >
                      {step.status === 'completed' ? <Check className="h-6 w-6" /> : step.icon}
                    </div>

                    <div className="pt-3">
                      <h3 className={`font-serif text-lg mb-1 ${step.status === 'upcoming' ? 'text-black dark:text-white' : 'text-black dark:text-cream-dark'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${step.status === 'upcoming' ? 'text-black dark:text-white' : 'text-black dark:text-white'}`}>
                        {step.date} {step.time && `• ${step.time}`}
                      </p>

                      {step.status === 'active' && (
                        <div className="mt-3 p-3 bg-gold/5 border border-gold/20">
                          <p className="text-sm text-gold flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Currently in progress...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-black dark:border-white dark:border-black dark:border-white transition-colors duration-300 text-center">
              <p className="text-black dark:text-white text-sm mb-4">Need help with your order?</p>
              <a
                href="https://wa.me/917631410643"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline inline-flex items-center gap-2 text-sm"
              >
                Contact Support
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
