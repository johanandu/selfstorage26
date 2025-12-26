import React from 'react';
import { motion } from 'framer-motion';

const PremiumCard = ({ unit, onSelect, isSelected }) => {
  const formatPrice = (price) => {
    return (price / 100).toFixed(2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'occupied':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Dostępny';
      case 'occupied':
        return 'Zajęty';
      default:
        return 'Nieznany';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`premium-card cursor-pointer ${isSelected ? 'ring-2 ring-accent' : ''} ${
        unit.status === 'occupied' ? 'opacity-75 cursor-not-allowed' : ''
      }`}
      onClick={() => unit.status === 'available' && onSelect(unit)}
    >
      {/* Status Badge */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(unit.status)}`} />
          <span className="text-sm text-gray-300">{getStatusText(unit.status)}</span>
        </div>
        {unit.status === 'available' && (
          <div className="bg-accent text-text-dark px-3 py-1 rounded-full text-sm font-semibold">
            Premium
          </div>
        )}
      </div>

      {/* Unit Image */}
      <div className="aspect-video bg-secondary rounded-xl mb-4 overflow-hidden">
        {unit.image_url ? (
          <img 
            src={unit.image_url} 
            alt={`Magazyn ${unit.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl text-gray-600">📦</div>
          </div>
        )}
      </div>

      {/* Unit Info */}
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-accent font-canela">{unit.name}</h3>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Powierzchnia:</span>
          <span className="font-semibold">{unit.size}</span>
        </div>

        <div className="border-t border-secondary pt-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Cena miesięczna:</span>
            <div className="text-right">
              <span className="text-3xl font-bold text-accent font-canela">
                {formatPrice(unit.price_gross)}
              </span>
              <span className="text-gray-300 ml-1">PLN</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-1">Brutto (VAT 23%)</p>
        </div>

        {unit.status === 'available' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-accent text-text-dark font-bold py-3 rounded-xl hover:bg-gray-300 transition-colors"
          >
            {isSelected ? 'Wybrany' : 'Wybierz'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default PremiumCard;