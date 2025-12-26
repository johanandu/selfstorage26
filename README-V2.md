# Self-Storage V2.0 - Award Winning Design

## 🚀 Co nowego w V2.0

### 1. Astro 5.16+ Upgrade
- **Server Islands** - asynchroniczne ładowanie statusów magazynów
- **Content Layer** - type-safe content dla definicji magazynów
- **View Transitions** - płynne przejścia między stronami
- **Performance** - jeszcze szybsze ładowanie

### 2. Bento Grid UI
- **Nowy layout** inspirowany Apple/Linear
- **Różne wielkości kafelków** - adaptive grid
- **Glassmorphism** - subtelne rozmycia i przezroczystość
- **Micro-interactions** - hover effects i animacje

### 3. Booking Wizard
- **Konfigurator wynajmu** zamiast prostego przycisku
- **Wybór rozmiaru** - wizualna prezentacja pojemności
- **Okres wynajmu** - miesiąc/rok z rabatem
- **Live podsumowanie** - cena aktualizowana na żywo

### 4. Design System V2
- **Głębsza czerń** (#0a0a0a) zamiast #1A1A1A
- **Bielszy akcent** (#f5f5f5) zamiast #EAEAEA
- **Glass panels** z backdrop-blur
- **Inter Display** dla nagłówków

## 🏗️ Nowa struktura

```
src/
├── content/           # Astro Content Layer
│   └── units/        # Definicje magazynów
├── components/
│   ├── bento/        # Kafelki Bento Grid
│   │   ├── StatsTile.astro
│   │   ├── GateTile.jsx
│   │   └── WeatherTile.astro
│   ├── wizard/       # Konfigurator wynajmu
│   │   ├── StepSize.jsx
│   │   ├── StepSummary.jsx
│   │   └── BookingWizard.jsx
│   └── UnitStatus.astro  # Server Island
└── layouts/
    └── LayoutV2.astro    # Nowy layout z View Transitions
```

## 🎨 Nowe komponenty

### Bento Grid
```astro
<StatsTile 
  title="Dostępne magazyny" 
  value={availableCount} 
  icon="📦"
  size="medium"
/>
```

### Server Island
```astro
<UnitStatus server:defer unitId="1" />
```

### Booking Wizard
```jsx
<BookingWizard 
  isOpen={isOpen}
  onClose={onClose}
  unitData={unitData}
/>
```

## 📱 Nowy flow użytkownika

1. **Landing** - Bento Grid z live statystykami
2. **Konfigurator** - wieloetapowy wizard
3. **Podsumowanie** - live pricing z rabatami
4. **Checkout** - płatność przez Stripe
5. **Dashboard** - Bento Grid z personalizowanymi danymi

## 🔧 Migracja z V1

### Package.json
```json
{
  "astro": "^5.16.0",
  "@astrojs/react": "^4.0.0",
  "framer-motion": "^11.0.0"
}
```

### Astro config
```js
experimental: {
  serverIslands: true,
  contentLayer: true,
}
```

### Tailwind colors
```js
colors: {
  background: '#0a0a0a',    // Zmienione
  'bg-primary': '#1a1a1a',  // Nowy
  'bg-secondary': '#2a2a2a', // Nowy
  accent: '#f5f5f5',        // Zmienione
}
```

## 🎯 Kluczowe ulepszenia

### Performance
- **Server Islands** - ładowanie asynchroniczne
- **Content Layer** - statyczne dane są pre-buildowane
- **View Transitions** - natywne animacje Astro

### UX
- **Bento Grid** - lepsza organizacja treści
- **Glassmorphism** - nowoczesny wygląd
- **Booking Wizard** - lepsza konwersja

### Developer Experience
- **Type-safe content** - Content Layer
- **Server Islands** - łatwiejsze zarządzanie stanem
- **View Transitions** - prostsze animacje

## 🚀 Deployment

1. **Update dependencies:**
   ```bash
   npm update
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Deploy** na Vercel/Netlify zgodnie z README

## 📊 Porównanie V1 vs V2

| Feature | V1 | V2 |
|---------|-----|-----|
| Astro version | 4.x | 5.16+ |
| UI Pattern | Card List | Bento Grid |
| Design | Premium | Award Winning |
| Animations | Framer Motion | View Transitions |
| Content | Dynamic | Content Layer |
| Performance | Fast | Lightning Fast |
| Booking | Simple Button | Multi-step Wizard |

## 🎨 Design Tokens

```css
/* Colors */
--bg: #0a0a0a;
--bg-primary: #1a1a1a;
--bg-secondary: #2a2a2a;
--accent: #f5f5f5;

/* Glass */
--glass-bg: rgba(42, 42, 42, 0.1);
--glass-border: rgba(245, 245, 245, 0.1);

/* Shadows */
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
```

---

**V2.0 gotowy do działania!** 🏆