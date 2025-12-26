import React from 'react';
import { motion } from 'framer-motion';
import { Check, Calendar, Percent } from 'lucide-react';

const StepSummary = ({ selectedSize, selectedPeriod, onBack, onPay }) => {
  const sizeConfig = {
    small: { name: 'Mały Boks', size: '5m²', price: 200 },
    medium: { name: 'Średni Boks', size: '8m²', price: 320 },
    large: { name: 'Duży Boks', size: '12m²', price: 480 },
  };

  const periodConfig = {
    month: { name: 'Miesiąc', discount: 0 },
    year: { name: 'Rok', discount: 10 },
  };

  const config = sizeConfig[selectedSize];
  const period = periodConfig[selectedPeriod];

  const monthlyPrice = config.price;
  const discountAmount = Math.round((monthlyPrice * period.discount) / 100);
  const finalPrice = monthlyPrice - discountAmount;
  const totalPrice = selectedPeriod === 'year' ? finalPrice * 12 : finalPrice;

  const formatPrice = (price) => `${price} PLN`;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 class="text-4xl font-bold text-accent font-display mb-4">
          Podsumowanie wynajmu
        </h2>
        <p class="text-gray-300 text-lg">
          Sprawdź szczegóły przed płatnością
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Details */}
        <div className="space-y-6">
          <div className="bg-bg-secondary rounded-2xl p-6">
            <h3 className="text-xl font-bold text-accent mb-4">Szczegóły zamówienia</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-700">
                <div>
                  <div className="font-medium text-accent">{config.name}</div>
                  <div className="text-sm text-gray-400">{config.size}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-accent">{formatPrice(monthlyPrice)}</div>
                  <div className="text-sm text-gray-400">/miesiąc</div>
                </div>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-700">
                <div>
                  <div className="font-medium text-accent">Okres wynajmu</div>
                  <div className="text-sm text-gray-400">{period.name}</div>
                </div>
                <div className="text-accent">
                  {period.discount > 0 && (
                    <div className="flex items-center space-x-2">
                      <Percent className="w-4 h-4" />
                      <span className="text-green-400">-{period.discount}%</span>
                    </div>
                  )}
                </div>
              </div>

              {period.discount > 0 && (
                <div className="flex justify-between items-center py-3 text-green-400">
                  <div>Rabat za {period.name.toLowerCase()}</div>
                  <div>-{formatPrice(discountAmount)}</div>
                </div>
              )}

              <div className="flex justify-between items-center py-3 text-lg font-bold border-t border-gray-700">
                <div className="text-accent">Łącznie</div>
                <div className="text-accent">
                  {formatPrice(totalPrice)}
                  {selectedPeriod === 'year' && (
                    <span className="text-sm font-normal text-gray-400 ml-1">
                      /rok
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-green-400 font-medium">Oszczędzasz {formatPrice(discountAmount * (selectedPeriod === 'year' ? 12 : 1))} rocznie!</div>
                <div className="text-sm text-gray-400">
                  {period.discount > 0 ? 'Dzięki wyboru dłuższego okresu' : 'Cena standardowa'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="space-y-6">
          <div className="bg-bg-secondary rounded-2xl p-6">
            <h3 className="text-xl font-bold text-accent mb-4">Płatność</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full" />
                </div>
                <div>
                  <div className="font-medium text-accent">Stripe</div>
                  <div className="text-sm text-gray-400">Bezpieczna płatność</div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span>Karta kredytowa/debetowa</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span>BLIK</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span>Przelewy24</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-bg-secondary rounded-2xl p-6">
            <h3 className="text-xl font-bold text-accent mb-4">Co otrzymujesz?</h3>
            
            <div className="space-y-3">
              {[
                'Dostęp 24/7 do magazynu',
                'Monitoring i ochrona',
                'Faktura VAT automatycznie',
                'Możliwość rezygnacji w każdym momencie',
                'Wózek do transportu (duże magazyny)',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-400 hover:text-accent transition-colors"
        >
          ← Zmień wybór
        </button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPay}
          className="px-8 py-4 bg-accent text-text-dark font-bold rounded-xl hover:bg-gray-300 transition-colors flex items-center space-x-2"
        >
          <span>Przejdź do płatności</span>
          <Calendar className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default StepSummary;