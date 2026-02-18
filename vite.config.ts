import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode (also loads .env.build for base path)
  const env = loadEnv(mode, process.cwd(), '');

  // Use VITE_BASE_PATH from setup-config.js, fall back to default
  const basePath = env.VITE_BASE_PATH || '/disciple-ranking/embaixadores-do-rei/';

  return {
    base: basePath,
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Make APP_CONFIG available in client code
    define: {
      'import.meta.env.VITE_APP_CONFIG': JSON.stringify(env.VITE_APP_CONFIG || 'royal-ambassadors'),
    },
  };
});
