import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Kapag "npm run build" (production test), ilalagay ang Admin Portal sa
  // "/admin/" subfolder para pareho silang isang origin ng Storefront kapag
  // sabay silang sine-serve (kailangan para magkapareho ang localStorage nila).
  // Sa "npm run dev" (araw-araw na coding), base pa rin ito sa "/" gaya ng dati.
  base: process.env.BUILD_TARGET === 'combined' ? '/admin/' : '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
});