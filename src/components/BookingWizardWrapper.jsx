import React, { useState } from 'react';
import BookingWizard from './wizard/BookingWizard';

const BookingWizardWrapper = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const openWizard = (unitData = null) => {
    setSelectedUnit(unitData);
    setIsOpen(true);
  };

  const closeWizard = () => {
    setIsOpen(false);
    setSelectedUnit(null);
  };

  // Expose functions globally for Astro integration
  if (typeof window !== 'undefined') {
    window.openBookingWizard = openWizard;
  }

  return (
    <BookingWizard
      isOpen={isOpen}
      onClose={closeWizard}
      unitData={selectedUnit}
    />
  );
};

export default BookingWizardWrapper;