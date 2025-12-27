import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix dla ikon Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapComponent = ({ units = [], center = [52.2297, 21.0122], zoom = 12 }) => {
  const [mapUnits, setMapUnits] = useState([]);

  useEffect(() => {
    // Pobierz jednostki z lokalizacją
    const fetchUnits = async () => {
      try {
        const response = await fetch('/api/units/map');
        const data = await response.json();
        setMapUnits(data);
      } catch (error) {
        console.error('Błąd pobierania jednostek:', error);
        setMapUnits(units);
      }
    };

    fetchUnits();
  }, [units]);

  const getMarkerIcon = (status) => {
    const color = status === 'available' ? '#22c55e' : '#ef4444';
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: white;
          font-weight: bold;
        ">
          ${status === 'available' ? '✓' : '✗'}
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });
  };

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden border border-glass-border">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-2xl"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {mapUnits.map((unit) => (
          <Marker
            key={unit.id}
            position={[unit.latitude, unit.longitude]}
            icon={getMarkerIcon(unit.status)}
          >
            <Popup className="custom-popup">
              <div className="bg-bg-primary text-text-light p-4 rounded-lg min-w-[200px]">
                <h3 className="font-bold text-accent mb-2">{unit.name}</h3>
                <p className="text-sm text-gray-300 mb-2">{unit.size}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-accent">
                    {unit.price_gross / 100} PLN/mies.
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    unit.status === 'available' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {unit.status === 'available' ? 'Dostępny' : 'Zajęty'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">{unit.address_display}</p>
                {unit.status === 'available' && (
                  <button
                    onClick={() => window.location.href = `/checkout?unit=${unit.id}`}
                    className="w-full bg-accent text-text-dark font-bold py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    Wynajmij teraz
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;