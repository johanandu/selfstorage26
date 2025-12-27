import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Check, X, AlertTriangle } from 'lucide-react';

const MoveOutTile = ({ unitId, unitName, subscriptionId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    
    try {
      // Upload do Supabase Storage
      const fileName = `${unitId}-${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('move-out-proofs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      setUploadedImage(data.path);
      setStep(2);
    } catch (error) {
      alert('Błąd podczas uploadu zdjęcia');
    } finally {
      setUploading(false);
    }
  };

  const confirmMoveOut = async () => {
    try {
      const response = await fetch('/api/move-out/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unitId,
          subscriptionId,
          proofImageUrl: uploadedImage,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setCompleted(true);
        setStep(3);
      } else {
        alert(`Błąd: ${result.error}`);
      }
    } catch (error) {
      alert('Błąd połączenia z serwerem');
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="col-span-1 row-span-1 bg-glass-bg border border-glass-border rounded-3xl p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/20"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl">📤</div>
          <div className="text-xs text-gray-500">EXIT</div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400">Zwolnij magazyn</h3>
          <div className="text-xl font-bold text-red-400 font-display">Move-Out</div>
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
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <h2 className="text-2xl font-bold text-accent font-display">
                    Zwolnij {unitName}
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
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <h3 className="text-lg font-bold text-red-400 mb-2">Uwaga!</h3>
                      <p className="text-gray-300 text-sm">
                        Po zgłoszeniu zwolnienia magazynu, Twój dostęp zostanie zablokowany na koniec okresu rozliczeniowego. Upewnij się, że wszystkie Twoje rzeczy zostały odebrane.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-accent mb-4">Zrób zdjęcie pustego magazynu</h3>
                      <p className="text-gray-300 mb-6">
                        Zdjęcie jest wymagane jako dowód, że magazyn został opróżniony i pozostawiony w czystym stanie.
                      </p>

                      <div className="border-2 border-dashed border-gray-600 rounded-2xl p-8 text-center hover:border-accent transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="photoUpload"
                        />
                        <label htmlFor="photoUpload" className="cursor-pointer">
                          {uploadedImage ? (
                            <div className="space-y-4">
                              <Check className="w-16 h-16 text-green-400 mx-auto" />
                              <div className="text-green-400 font-medium">Zdjęcie dodane!</div>
                              <div className="text-sm text-gray-400">Kliknij aby zmienić</div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <Camera className="w-16 h-16 text-gray-400 mx-auto" />
                              <div className="text-gray-300 font-medium">Kliknij aby zrobić zdjęcie</div>
                              <div className="text-sm text-gray-500">
                                {uploading ? 'Uploadowanie...' : 'Obsługiwane formaty: JPG, PNG'}
                              </div>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {uploadedImage && (
                      <button
                        onClick={() => setStep(2)}
                        className="w-full bg-accent text-text-dark font-bold py-4 rounded-xl hover:bg-gray-300 transition-colors"
                      >
                        Dalej
                      </button>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-accent mb-4">Podsumowanie zwolnienia</h3>
                    </div>

                    <div className="bg-bg-secondary rounded-xl p-6 space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Magazyn:</span>
                        <span className="font-bold text-accent">{unitName}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-300">Data zgłoszenia:</span>
                        <span className="text-accent">{new Date().toLocaleDateString('pl-PL')}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-300">Dostęp zablokowany:</span>
                        <span className="text-red-400">Koniec okresu rozliczeniowego</span>
                      </div>
                      
                      <div className="flex justify-between border-t border-gray-700 pt-4">
                        <span className="text-gray-300">Status subskrypcji:</span>
                        <span className="text-yellow-400">Anulowana na koniec okresu</span>
                      </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <div>
                          <div className="text-yellow-400 font-medium">Ważne informacje</div>
                          <div className="text-sm text-gray-300 mt-1">
                            • Do końca okresu możesz normalnie korzystać z magazynu<br/>
                            • Po zakończeniu dostęp zostanie automatycznie zablokowany<br/>
                            • Faktura VAT zostanie wysłana na email
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 border border-gray-600 text-gray-300 font-bold py-4 rounded-xl hover:bg-gray-700 transition-colors"
                      >
                        Wstecz
                      </button>
                      <button
                        onClick={confirmMoveOut}
                        className="flex-1 bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-colors"
                      >
                        Zgłoś zwolnienie
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && completed && (
                  <div className="text-center space-y-6">
                    <Check className="w-20 h-20 text-green-400 mx-auto" />
                    <h3 className="text-3xl font-bold text-accent">Zgłoszenie przyjęte!</h3>
                    <p className="text-gray-300 max-w-md mx-auto">
                      Twoje zgłoszenie zwolnienia magazynu zostało przyjęte. Otrzymasz potwierdzenie na email.
                    </p>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="bg-accent text-text-dark font-bold py-4 px-8 rounded-xl hover:bg-gray-300 transition-colors"
                    >
                      Zamknij
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

export default MoveOutTile;