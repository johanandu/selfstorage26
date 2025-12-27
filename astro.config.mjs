// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),

  integrations: [
    react(),
    tailwind({
      applyBaseStyles: true, // Ważne dla wyglądu
    }),
  ],

  // SEKCJĘ 'experimental' USUNĄŁEM CAŁKOWICIE - JEST ZBĘDNA W ASTRO 5

  vite: {
    define: {
      'process.env': {} // Fix dla Stripe/React
    }
  }
});