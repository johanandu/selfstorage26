# Self-Storage v1.0

Premium UX + Pełna Automatyzacja (Astro/Supabase)

## 🚀 Funkcje

- **Premium UX** - Design inspirowany Apple, płynne animacje Framer Motion
- **Płatności BLIK** - Integracja z Stripe (BLIK, Przelewy24, karty)
- **Automatyczne faktury VAT** - Integracja z Fakturownia API
- **Bezobsługowa brama** - Automatyczne otwieranie po płatności
- **Mobile First** - Responsywny design z Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Astro 4.x (SSR Mode)
- **UI**: React (Astro Islands)
- **Styling**: Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth RLS)
- **Płatności**: Stripe (Polska: karty + BLIK + Przelewy24)
- **Faktury**: Fakturownia API
- **Animacje**: Framer Motion

## 📦 Instalacja

### 1. Sklonuj repozytorium

```bash
git clone <repository-url>
cd self-storage-system
```

### 2. Zainstaluj zależności

```bash
npm install
```

### 3. Skonfiguruj zmienne środowiskowe

Skopiuj `.env.example` do `.env` i uzupełnij dane:

```bash
cp .env.example .env
```

Wymagane zmienne:

```env
# Supabase
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Fakturownia
FAKTUROWNIA_API_TOKEN=your_fakturownia_api_token
FAKTUROWNIA_DOMAIN=your_domain.fakturownia.pl

# Gate Controller
GATE_API_URL=http://localhost:8080/api/gate
GATE_API_TOKEN=your_gate_api_token

# App URL
PUBLIC_APP_URL=http://localhost:4321
```

### 4. Skonfiguruj Supabase

1. Utwórz nowy projekt w Supabase
2. Przejdź do SQL Editor i wklej zawartość `supabase-schema.sql`
3. Uruchom skrypt aby utworzyć tabele i polityki RLS
4. Skopiuj URL i klucze do pliku `.env`

### 5. Skonfiguruj Stripe

1. Zaloguj się do Stripe Dashboard
2. Upewnij się że konto jest ustawione na Polskę (PLN)
3. Włącz metody płatności:
   - Przejdź do Settings → Payment methods
   - Włącz "Przelewy24"
   - BLIK jest dostępny automatycznie dla PLN
4. Skopiuj klucze API do pliku `.env`
5. Ustaw webhook:
   - Endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Zdarzenia: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`

### 6. Skonfiguruj Fakturownia

1. Zaloguj się do Fakturownia.pl
2. Przejdź do Ustawienia → API
3. Wygeneruj token API
4. Skopiuj token i domenę do pliku `.env`

### 7. Uruchom aplikację

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:4321`

## 🏗️ Struktura projektu

```
src/
├── components/
│   └── ui/
│       ├── PremiumCard.jsx    # Kafelki magazynów
│       └── GateButton.jsx     # Przycisk otwierania bramy
├── lib/
│   ├── stripe.ts              # Konfiguracja Stripe
│   ├── supabase.ts            # Konfiguracja Supabase
│   ├── fakturownia.ts         # Integracja Fakturownia
│   └── gate-controller.ts     # Kontroler bramy
├── pages/
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── stripe.ts      # Webhook Stripe
│   │   └── gate/
│   │       └── open.ts        # API otwierania bramy
│   ├── auth/
│   │   ├── login.astro        # Logowanie
│   │   └── register.astro     # Rejestracja
│   ├── checkout.astro         # Płatność
│   ├── dashboard.astro        # Panel użytkownika
│   └── index.astro            # Strona główna
├── layouts/
│   └── Layout.astro           # Layout główny
└── styles/
    └── global.css             # Style globalne
```

## 🔧 Konfiguracja bramy

### Opcja 1: Symulacja (Development)

Aplikacja domyślnie używa symulacji bramy. W logach zobaczysz informacje o "otwieraniu" bramy.

### Opcja 2: Prawdziwa brama

1. Skonfiguruj sterownik bramy z API HTTP
2. Ustaw zmienne środowiskowe:
   ```env
   GATE_API_URL=http://your-gate-controller-ip:port/api
   GATE_API_TOKEN=your_gate_api_token
   ```
3. Implementuj endpoint `/api/gate/open` w sterowniku

Przykładowy payload:
```json
{
  "unit_id": "1",
  "user_id": "uuid-usera",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 📱 Flow aplikacji

1. **Landing Page** → Użytkownik wybiera magazyn
2. **Autoryzacja** → Logowanie/Rejestracja
3. **Checkout** → Płatność przez Stripe (BLIK/Przelewy24/Karta)
4. **Webhook** → Automatyczne:
   - Oznaczenie magazynu jako zajęty
   - Wygenerowanie faktury VAT
   - Wysłanie faktury na email
   - Utworzenie subskrypcji
5. **Dashboard** → Użytkownik klika "OTWÓRZ" i brama się otwiera

## 🔍 Rozwiązywanie problemów

### Błąd RLS
- Upewnij się że użytkownik jest zalogowany
- Sprawdź polityki RLS w Supabase
- Użyj service key dla operacji serwerowych

### Błąd płatności Stripe
- Sprawdź czy konto Stripe jest ustawione na Polskę
- Upewnij się że Przelewy24 jest włączone w dashboardzie
- Sprawdź walutę (musi być PLN)

### Błąd Fakturownia
- Sprawdź poprawność tokena API
- Upewnij się że domena jest poprawna
- Sprawdź limity API w Fakturownia

## 🚀 Deployment

### Vercel
1. Podłącz repozytorium do Vercel
2. Ustaw zmienne środowiskowe
3. Deploy!

### Inny hosting
1. Zbuduj projekt: `npm run build`
2. Uruchom: `npm run preview`
3. Skonfiguruj reverse proxy (np. nginx)

## 📄 Licencja

MIT License

## 🤝 Współpraca

1. Fork projektu
2. Utwórz branch (`git checkout -b feature/AmazingFeature`)
3. Commit zmiany (`git commit -m 'Add some AmazingFeature'`)
4. Push do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź sekcję "Rozwiązywanie problemów"
2. Przejrzyj logi w konsoli
3. Sprawdź status usług zewnętrznych (Supabase, Stripe, Fakturownia)

---

**Self-Storage v1.0** - Premium UX + Pełna Automatyzacja 🚀