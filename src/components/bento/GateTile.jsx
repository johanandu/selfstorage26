import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Unlock, Lock, Loader2, ArrowRight } from 'lucide-react';

const GateTile = ({ isSubscribed = true, unitId, unitName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(isSubscribed ? 'ready' : 'locked');

  const handleOpenGate = async () => {
    if (status !== 'ready' || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/gate/open', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unitId }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('opened');
        setTimeout(() => setStatus('ready'), 3000);
      } else {
        alert(`Błąd: ${result.error}`);
      }
    } catch (error) {
      alert('Błąd połączenia z serwerem');
    } finally {
      setIsLoading(false);
    }
  };

  const getContent = () => {
    if (isLoading) {
      return {
        icon: <Loader2 className="w-8 h-8 animate-spin" />,
        title: 'Otwieranie...',
        subtitle: 'Proszę czekać',
        buttonText: 'OTWIERANIE',
        bgColor: 'bg-yellow-500/20',
        textColor: 'text-yellow-400',
      };
    }

    if (status === 'opened') {
      return {
        icon: <ArrowRight className="w-8 h-8" />,
        title: 'Brama otwarta!',
        subtitle: 'Możesz wjechać',
        buttonText: 'OTWARTE',
        bgColor: 'bg-green-500/20',
        textColor: 'text-green-400',
      };
    }

    if (status === 'locked') {
      return {
        icon: <Lock className="w-8 h-8" />,
        title: 'Brama zablokowana',
        subtitle: 'Opłać subskrypcję',
        buttonText: 'ZABLOKOWANE',
        bgColor: 'bg-red-500/20',
        textColor: 'text-red-400',
      };
    }

    return {
      icon: <Unlock className="w-8 h-8" />,
      title: 'Brama gotowa',
      subtitle: unitName || 'Kliknij aby otworzyć',
      buttonText: 'OTWÓRZ BRAMĘ',
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400',
    };
  };

  const content = getContent();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: status === 'ready' ? 1.02 : 1 }}
      whileTap={{ scale: status === 'ready' ? 0.98 : 1 }}
      className="col-span-3 row-span-2 bg-glass-bg border border-glass-border rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-accent/20 cursor-pointer"
      onClick={handleOpenGate}
    >
      <div className="flex items-center justify-between h-full">
        <div className="flex-1">
          <div className={`inline-flex p-4 rounded-2xl ${content.bgColor} mb-6`}>
            <div className={content.textColor}>{content.icon}</div>
          </div>
          
          <h3 className="text-2xl font-bold text-accent font-display mb-2">
            {content.title}
          </h3>
          <p className="text-gray-400">{content.subtitle}</p>
        </div>
        
        <div className="flex flex-col items-end space-y-4">
          <div className={`px-6 py-3 rounded-2xl ${content.bgColor} ${content.textColor} font-bold text-lg`}>
            {content.buttonText}
          </div>
          
          <div className="text-sm text-gray-500">
            {unitName && `Magazyn: ${unitName}`}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GateTile;