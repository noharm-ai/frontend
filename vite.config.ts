import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Identifies this build. Stamped into index.html (meta app-build) and the
// bundle (import.meta.env.VITE_APP_BUILD_ID) so a running tab can tell when a
// newer deploy is live (src/features/appVersion). Setting it on process.env
// makes Vite expose it like any other VITE_ variable.
process.env.VITE_APP_BUILD_ID ||= Date.now().toString(36);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  legacy: {
    inconsistentCjsInterop: true,
  },
  resolve: {
    alias: {
      src: "/src",
      assets: "/src/assets",
      components: "/src/components",
      containers: "/src/containers",
      features: "/src/features",
      hooks: "/src/hooks",
      lib: "/src/lib",
      models: "/src/models",
      pages: "/src/pages",
      routes: "/src/routes",
      services: "/src/services",
      store: "/src/store",
      styles: "/src/styles",
      translations: "/src/translations",
      utils: "/src/utils",
    },
  },
});
