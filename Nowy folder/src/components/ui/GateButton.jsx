import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Loader2 } from 'lucide-react';

const GateButton = ({ onOpenGate, isSubscribed }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = async () => {
    if (!isSubscribed || isLoading) return;
    
    setIsLoading(true);
    try {
      await onOpenGate();
    } catch (error) {
      console.error('Błąd podczas otwierania bramy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">OTWIERANIE...</span>
        </>
      );
    }

    if (!isSubscribed) {
      return (
        <>
          <Lock className="w-6 h-6" />
          <span className="ml-2">BLOKADA</span>
        </>
      );
    }

    return (
      <>
        <Unlock className="w-6 h-6" />
        <span className="ml-2">OTWÓRZ BRAMĘ</span>
      </>
    );
  };

  return (
    <motion.button
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      whileHover={isSubscribed && !isLoading ? { scale: 1.05 } : {}}
      whileTap={isSubscribed && !isLoading ? { scale: 0.95 } : {}}
      onClick={handleOpen}
      disabled={!isSubscribed || isLoading}
      className={`gate-button flex items-center justify-center min-w-[280px] ${
        !isSubscribed 
          ? 'bg-red-600 cursor-not-allowed' 
          : isLoading 
          ? 'loading' 
          : ''
      }`}
    >
      {getButtonContent()}
    </motion.button>
  );
};

export default GateButton;