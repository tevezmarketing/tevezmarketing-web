import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://tevezmarketing.digital',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    server: {
      host: '0.0.0.0'
    }
  }
});
