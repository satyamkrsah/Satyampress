import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WhatsAppFloatingButton = () => {
  return (
    <motion.a
      href="https://wa.me/917631410643"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-gold text-black p-4 rounded-full shadow-lg hover:bg-gold-light hover:shadow-xl transition-all duration-300"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      <MessageCircle className="h-7 w-7" />
    </motion.a>
  );
};

export default WhatsAppFloatingButton;
