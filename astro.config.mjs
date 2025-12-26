// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  
  // 1. Adapter Vercel (wymagany do hostingu)
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),

  integrations: [
    react(),
    // 2. Tailwind: Zmieniamy na TRUE, żeby odzyskać style, jeśli ich brakuje
    tailwind({
      applyBaseStyles: true, 
    }),
  ],

  // 3. Przywracamy "Polyfill" dla process.env (naprawia Reacta/Stripe)
  vite: {
    define: {
      'process.env': {}
    },
    ssr: {
      noExternal: ['path-to-regexp'] // Opcjonalnie: często potrzebne przy Vercel
    }
  }
});