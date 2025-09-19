import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-192.svg', 'icons/icon-512.svg'],
      manifest: {
        name: 'customizeMyself',
        short_name: 'customizeMyself',
        description:
          '3D 온라인 피팅 앱 MVP. 사용자 치수 기반 마네킹과 오픈소스 의상 피팅을 실시간으로 제공합니다.',
        start_url: '/',
        display: 'standalone',
        background_color: '#040608',
        theme_color: '#4b8cff',
        lang: 'ko',
        icons: [
          {
            src: 'icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
});
