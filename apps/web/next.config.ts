import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // 404 para URLs fora de qualquer rota: o app tem dois root layouts (app/[locale] e app/painel).
    globalNotFound: true,
  },
  // O pacote compartilhado é compilado pelo próprio Next (monorepo).
  transpilePackages: ['@bv/shared'],
  images: {
    // A API já gera as versões otimizadas (WebP grande + miniatura) no upload;
    // o next/image cuida só de lazy-load, dimensões e prioridade.
    unoptimized: true,
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
