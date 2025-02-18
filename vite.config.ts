import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            "babel-plugin-styled-components",
            {
              displayName: true,
              fileName: false,
              cssProp: true,
            },
          ],
        ],
      },
    }),
  ],
  server: {
    port: 3000,
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
