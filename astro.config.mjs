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
  experimental: {
    serverIslands: true,
    contentLayer: true,
  },
  vite: {
    define: { 'process.env': {} } // Fix dla Stripe/React
  }
});