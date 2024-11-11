/**
 * @fileoverview Vite configuration for Unserious Cookie Manager Browser Extension
 * @author John Paul Caigas (mra1k3r0) <github.com/mra1k3r0>
 * 
 * This configuration file sets up the build process for the Unserious CM Browser Extension.
 * It includes plugins for handling React and copying static assets, and configures
 * the build output and file resolution. It supports building for Chrome, Firefox, and Brave,
 * as well as Manifest V2 and V3 versions.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Get the target browser from command line arguments
const target = process.env.BROWSER_TARGET || 'chrome';

/**
 * Custom plugin to copy static files during the build process
 * @returns {import('vite').Plugin}
 */
const copyStaticFiles = () => {
  return {
    name: 'copy-static-files',
    writeBundle(options, bundle) {
      const publicDir = path.resolve(__dirname, 'public');
      const distDir = path.resolve(__dirname, `dist-${target}`);
      
      // Ensure dist directory exists
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }

      // Copy manifest file based on target
      let manifestSource = 'manifest.json';
      if (target === 'firefox') {
        manifestSource = 'manifest-firefox.json';
      } else if (target === 'brave') {
        manifestSource = 'manifest-brave.json';
      } else if (target === 'chrome-v2') {
        manifestSource = 'manifest-v2.json';
      }

      fs.copyFileSync(
        path.join(publicDir, manifestSource),
        path.join(distDir, 'manifest.json')
      );
      console.log(`Copied ${manifestSource} as manifest.json to dist-${target} directory`);

      // Copy icon files
      const iconFiles = ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'];
      const iconDir = path.join(distDir, 'icons');
      if (!fs.existsSync(iconDir)) {
        fs.mkdirSync(iconDir, { recursive: true });
      }
      iconFiles.forEach(file => {
        const sourcePath = path.join(publicDir, 'icons', file);
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, path.join(iconDir, file));
          console.log(`Copied ${file} to dist-${target}/icons directory`);
        } else {
          console.warn(`Warning: ${file} not found in public/icons directory`);
        }
      });

      // Copy other necessary files (excluding .json files and icons folder)
      fs.readdirSync(publicDir).forEach(file => {
        if (!file.endsWith('.json') && file !== 'icons') {
          const sourcePath = path.join(publicDir, file);
          const destPath = path.join(distDir, file);
          if (fs.lstatSync(sourcePath).isFile()) {
            fs.copyFileSync(sourcePath, destPath);
            console.log(`Copied ${file} to dist-${target} directory`);
          }
        }
      });

      // Update and copy popup.html
      const cssFileName = Object.keys(bundle).find(file => file.endsWith('.css'));
      let popupContent = fs.readFileSync(path.join(publicDir, 'popup.html'), 'utf8');
      popupContent = popupContent
        .replace('<script src="popup.tsx"></script>', '<script type="module" src="popup.js"></script>')
        .replace('popup.css', cssFileName || '');
      fs.writeFileSync(path.join(distDir, 'popup.html'), popupContent);

      console.log(`Static files copied successfully for ${target}`);
    },
  };
};

/**
 * Vite configuration object
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  plugins: [
    react(),
    copyStaticFiles(),
  ],
  build: {
    outDir: `dist-${target}`,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/popup.tsx'),
        background: path.resolve(__dirname, 'src/background.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
