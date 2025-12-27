import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, X } from 'lucide-react';

const FAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Sprawdź czy jesteśmy na mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  const handleCall = () => {
    window.location.href = 'tel:+48123456789';
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Cześć! Mam pytanie o wynajem magazynu.');
    window.open(`https://wa.me/48123456789?text=${message}`, '_blank');
  };

  return (
    <>
      {/* Main FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-text-dark rounded-full shadow-2xl shadow-accent/30 flex items-center justify-center z-50"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Phone className="w-6 h-6" />
        )}
      </motion.button>

      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Call Button */}
            <motion.button
              initial={{ scale: 0, y: 0 }}
              animate={{ scale: 1, y: -80 }}
              exit={{ scale: 0, y: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCall}
              className="fixed bottom-6 right-6 w-12 h-12 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center z-40"
            >
              <Phone className="w-5 h-5" />
            </motion.button>

            {/* WhatsApp Button */}
            <motion.button
              initial={{ scale: 0, y: 0 }}
              animate={{ scale: 1, y: -140 }}
              exit={{ scale: 0, y: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWhatsApp}
              className="fixed bottom-6 right-6 w-12 h-12 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center z-40"
            >
              <MessageCircle className="w-5 h-5" />
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default FAB;