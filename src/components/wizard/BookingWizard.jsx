import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import StepSize from './StepSize';
import StepSummary from './StepSummary';

const BookingWizard = ({ isOpen, onClose, unitData }) => {
  const [step, setStep] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const steps = [
    { id: 1, name: 'Rozmiar', icon: '1' },
    { id: 2, name: 'Podsumowanie', icon: '2' },
  ];

  const handleNext = (data) => {
    if (step === 1) {
      setSelectedSize(data);
      setStep(2);
    } else if (step === 2) {
      handlePayment();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };

  const handlePayment = () => {
    // Przekierowanie do checkoutu Stripe
    const params = new URLSearchParams({
      unit: unitData?.id || selectedSize,
      period: selectedPeriod,
    });
    window.location.href = `/checkout?${params.toString()}`;
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-bg-primary rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-accent font-display">
              Konfigurator wynajmu
            </h2>
            <div className="flex items-center space-x-2">
              {steps.map((s, idx) => (
                <React.Fragment key={s.id}>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      step >= s.id
                        ? 'bg-accent text-text-dark'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {step > s.id ? <Check className="w-4 h-4" /> : s.icon}
                  </div>
                  <span
                    className={`text-sm ${
                      step >= s.id ? 'text-accent' : 'text-gray-400'
                    }`}
                  >
                    {s.name}
                  </span>
                  {idx < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <StepSize onNext={handleNext} onBack={handleBack} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <StepSummary
                  selectedSize={selectedSize}
                  selectedPeriod={selectedPeriod}
                  onPeriodChange={handlePeriodChange}
                  onBack={handleBack}
                  onPay={handlePayment}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookingWizard;