# System Self-Storage v1.0 - Design System

## 1. Filozofia Designu

### Design Philosophy

- **Główne Zasady**: Post-industrial luxury. Czysty, niemal galerijny minimalizm, który wyróżnia się na tle typowego, przemysłowego wyglądu magazynów. Projekt ma na celu stworzenie poczucia bezpieczeństwa i porządku poprzez elegancką prostotę i wysokiej jakości materiały.

### Content Density

- **Gęstość Treści**: Medium. Aplikacja powinna stosować umiarkowaną ilość treści, skupiając się na kluczowych interakcjach i dużych, czytelnych elementach. Priorytetem jest prostota przepływu pracy użytkownika (UX) i poczucie przestrzeni.

## 2. System Kolorów

**Paleta Główna**

- Kolor tła: #1A1A1A (Głęboka czerń, premium feel)
- Kolor podstawowy: #4A4A4A (Ciemny odcień szarości)
- Kolor drugorzędny: #6A6A6A (Średni odcień szarości)
- Kolor akcentujący: #EAEAEA (Jasny, kremowy odcień)

**Kolory Tekstu**

- Tekst ciemny (dla jasnych tł): #1A1A1A
- Tekst jasny (dla ciemnych tł): #EAEAEA

## 3. Typografia

**Czcionki**

- **Nagłówki**: Canela (Bold serif dla wysokiego kontrastu i luksusowego wrażenia)
- **Tekst podstawowy**: Neue Haas Grotesk (neutralny, czysty sans-serif dla wygody czytania)

**Hierarchia**

- H1: Canela Bold, 48px (ekran powitalny)
- H2: Canela Bold, 36px (sekcje)
- H3: Neue Haas Grotesk Bold, 24px (tytuły kart)
- Body: Neue Haas Grotesk Regular, 16px
- Small: Neue Haas Grotesk Regular, 14px (dane pomocnicze)

## 4. Efekty i Animacje

- **Efekty na Kafelkach**: Delikatne powiększenie (scale 1.02) przy najechaniu myszą z płynnym transition (300ms ease-out).
- **Przycisk "OTWÓRZ"**: Pulsowanie (subtelne skalowanie 0.98-1.02) z efektem "loading" - zmiana koloru tła na akcentowy (#EAEAEA) z czarnym tekstem podczas akcji.
- **Animacje Strony**: Płynne przesuwanie treści przy scrollu (Framer Motion), efekt paralaksy w tle.
- **Interakcje**: Glow effect na przyciskach primary (subtelny box-shadow w kolorze akcentowym).
