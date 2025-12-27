import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: true,
    }),
  ],
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  // TU BYŁA SEKCJA EXPERIMENTAL - USUNIĘTA, BO W ASTRO 5 TO STANDARD
  vite: {
    define: { 'process.env': {} } // Fix dla Stripe/React
  }
});