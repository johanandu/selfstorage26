import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Bike, Sofa, Home } from 'lucide-react';

const StepSize = ({ onNext, onBack }) => {
  const [selectedSize, setSelectedSize] = useState(null);

  const sizeOptions = [
    {
      id: 'small',
      name: 'Mały Boks',
      size: '5m²',
      price: 200,
      icon: Package,
      description: '25 kartonów lub 1 rower',
      features: ['Dla studentów', 'Małe meble', 'Dostęp 24/7'],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'medium',
      name: 'Średni Boks',
      size: '8m²',
      price: 320,
      icon: Sofa,
      description: '40 kartonów lub sofa + fotele',
      features: ['Małe mieszkanie', 'Meble tapicerowane', 'Monitoring'],
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'large',
      name: 'Duży Boks',
      size: '12m²',
      price: 480,
      icon: Home,
      description: '60 kartonów lub całe mieszkanie',
      features: ['Całe mieszkanie', 'Duże meble', 'Wózek transportowy'],
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-accent font-display mb-4">
          Wybierz rozmiar magazynu
        </h2>
        <p className="text-gray-300 text-lg">
          Dopasuj przestrzeń do swoich potrzeb
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sizeOptions.map((option, index) => {
          const Icon = option.icon;
          const isSelected = selectedSize === option.id;

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedSize(option.id)}
              className={`relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all duration-300 ${
                isSelected
                  ? 'ring-2 ring-accent shadow-2xl shadow-accent/20'
                  : 'bg-bg-secondary hover:bg-bg-primary'
              }`}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${option.color}`} />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${option.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-accent">{option.size}</div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-accent mb-2">{option.name}</h3>
                  <p className="text-gray-300 text-sm mb-4">{option.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="text-3xl font-bold text-accent font-display">
                    {option.price} PLN
                    <span className="text-sm font-normal text-gray-400">/miesiąc</span>
                  </div>
                  <div className="text-xs text-gray-500">Brutto (VAT 23%)</div>
                </div>

                <div className="space-y-2">
                  {option.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-4 border-t border-gray-700"
                    >
                      <div className="flex items-center space-x-2 text-accent">
                        <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                          <div className="w-2 h-2 bg-bg-primary rounded-full" />
                        </div>
                        <span className="text-sm font-medium">Wybrano</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-400 hover:text-accent transition-colors"
        >
          ← Powrót
        </button>
        <button
          onClick={() => selectedSize && onNext(selectedSize)}
          disabled={!selectedSize}
          className="px-8 py-3 bg-accent text-text-dark font-bold rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Dalej
        </button>
      </div>
    </div>
  );
};

export default StepSize;