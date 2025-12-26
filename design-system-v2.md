# Self-Storage V2.0 - Design System

## 1. Filozofia Designu

### Design Philosophy

- **Główne Zasady**: Post-industrial luxury meets cutting-edge technology. Minimalistyczny, galeryjny design z elementami szkła i precyzyjną typografią. Celem jest stworzenie wrażenia ekskluzywnego produktu premium, który jednocześnie jest funkcjonalny i nowoczesny.

### Content Density

- **Gęstość Treści**: Medium. Układ Bento Grid pozwala na inteligentne rozmieszczenie treści o różnej wadze wizualnej. Priorytet na czytelność i estetykę premium.

## 2. System Kolorów

**Paleta Główna**

- Kolor tła: #0a0a0a (Głębsza czerń niż V1)
- Kolor podstawowy: #1a1a1a (Poziom 2)
- Kolor drugorzędny: #2a2a2a (Poziom 3)
- Kolor akcentujący: #f5f5f5 (Bielszy odcień)

**Kolory Tekstu**

- Tekst ciemny (dla jasnych tł): #0a0a0a
- Tekst jasny (dla ciemnych tł): #f5f5f5

**Glassmorphism**

- Tło paneli: rgba(42, 42, 42, 0.1) z backdrop-blur-xl
- Border: rgba(245, 245, 245, 0.1)

## 3. Typografia

**Czcionki**

- **Nagłówki**: Inter Display (Bold dla wysokiego kontrastu)
- **Tekst podstawowy**: Inter (neutralny, czysty sans-serif)

**Hierarchia**

- H1: Inter Display Bold, 72px (ekran powitalny)
- H2: Inter Display Bold, 48px (sekcje)
- H3: Inter Bold, 32px (tytuły kafelków)
- Body: Inter Regular, 16px
- Small: Inter Regular, 14px (dane pomocnicze)

## 4. Efekty i Animacje

**View Transitions (Astro 5)**: Płynne przejścia między stronami z natywnym morphingiem

**Bento Grid Animations**:
- Hover: Podniesienie kafelka (translateY(-8px) + scale(1.02))
- Shadow: Rozproszony glow (box-shadow z rozmytym akcentem)
- Loading: Skeleton shimmer na Server Islands

**Glassmorphism Effects**:
- Backdrop blur na panelach nawigacyjnych
- Subtelne gradienty na krawędziach kafelków
- Przezroczystość zachowująca czytelność

**Micro-interactions**:
- Button hover: scale + glow effect
- Form inputs: focus ring z akcentem
- Loading states: eleganckie skeletony
