import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Share2, Clock, Check, X, Copy } from 'lucide-react';

const TeamAccessTile = ({ unitId, unitName, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    accessType: 'temporary',
    duration: 24, // godziny
  });
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/team/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unitId,
          ...formData,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setShares([...shares, result]);
        setStep(3);
        setCopiedCode(result.accessCode);
      } else {
        alert(`Błąd: ${result.error}`);
      }
    } catch (error) {
      alert('Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const revokeAccess = async (shareId) => {
    try {
      const response = await fetch(`/api/team/revoke/${shareId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShares(shares.filter(s => s.id !== shareId));
      }
    } catch (error) {
      alert('Błąd podczas usuwania dostępu');
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="col-span-1 row-span-1 bg-glass-bg border border-glass-border rounded-3xl p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/20"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl">👥</div>
          <div className="text-xs text-gray-500">B2B</div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400">Dostęp zespołowy</h3>
          <div className="text-xl font-bold text-accent font-display">Udostępnij</div>
        </div>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-primary rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-accent" />
                  <h2 className="text-2xl font-bold text-accent font-display">
                    Udostępnij dostęp do {unitName}
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-accent mb-4">Wybierz typ dostępu</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          {
                            id: 'temporary',
                            name: 'Jednorazowy',
                            description: 'Dostęp na określony czas',
                            icon: Clock,
                          },
                          {
                            id: 'permanent',
                            name: 'Stały',
                            description: 'Nieograniczony czas',
                            icon: Check,
                          },
                          {
                            id: 'recurring',
                            name: 'Cykliczny',
                            description: 'Powtarzający się',
                            icon: Share2,
                          },
                        ].map((type) => {
                          const Icon = type.icon;
                          const isSelected = formData.accessType === type.id;
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, accessType: type.id })}
                              className={`p-4 rounded-xl border transition-all ${
                                isSelected
                                  ? 'border-accent bg-accent/10'
                                  : 'border-gray-600 hover:border-gray-500'
                              }`}
                            >
                              <Icon className="w-8 h-8 text-accent mb-2" />
                              <div className="font-medium text-accent">{type.name}</div>
                              <div className="text-sm text-gray-400">{type.description}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Imię i nazwisko osoby
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.guestName}
                          onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                          className="w-full bg-bg-secondary border border-gray-600 rounded-lg px-4 py-3 text-accent placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
                          placeholder="Jan Kowalski"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email (opcjonalnie)
                        </label>
                        <input
                          type="email"
                          value={formData.guestEmail}
                          onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                          className="w-full bg-bg-secondary border border-gray-600 rounded-lg px-4 py-3 text-accent placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
                          placeholder="jan@firma.pl"
                        />
                      </div>

                      {formData.accessType === 'temporary' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Czas dostępu (godziny)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="168" // 7 dni
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                            className="w-full bg-bg-secondary border border-gray-600 rounded-lg px-4 py-3 text-accent placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent text-text-dark font-bold py-4 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Generowanie...' : 'Generuj kod dostępu'}
                      </button>
                    </form>
                  </div>
                )}

                {step === 3 && shares.length > 0 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-accent mb-2">Kod dostępu wygenerowany!</h3>
                      <p className="text-gray-300">
                        Przekaż ten kod osobie, której chcesz udostępnić magazyn
                      </p>
                    </div>

                    {shares.slice(-1).map((share) => (
                      <div key={share.id} className="bg-bg-secondary rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="font-bold text-accent">{share.guestName}</div>
                            <div className="text-sm text-gray-400">
                              {share.accessType === 'temporary' && `Ważny ${share.duration}h`}
                              {share.accessType === 'permanent' && 'Bezterminowo'}
                              {share.accessType === 'recurring' && 'Cyklicznie'}
                            </div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(share.accessCode)}
                            className="flex items-center space-x-2 bg-accent/10 hover:bg-accent/20 text-accent px-4 py-2 rounded-lg transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            <span>{copiedCode === share.accessCode ? 'Skopiowano!' : 'Kopiuj'}</span>
                          </button>
                        </div>
                        <div className="font-mono text-2xl text-accent bg-black/50 p-4 rounded-lg text-center">
                          {share.accessCode}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        setStep(1);
                        setFormData({ guestName: '', guestEmail: '', accessType: 'temporary', duration: 24 });
                      }}
                      className="w-full border border-accent text-accent font-bold py-4 rounded-xl hover:bg-accent/10 transition-colors"
                    >
                      Udostępnij kolejnej osobie
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TeamAccessTile;