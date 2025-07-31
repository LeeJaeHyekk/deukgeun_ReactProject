import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/frontend"),
      "@app": path.resolve(__dirname, "./src/frontend/app"),
      "@pages": path.resolve(__dirname, "./src/frontend/pages"),
      "@widgets": path.resolve(__dirname, "./src/frontend/widgets"),
      "@features": path.resolve(__dirname, "./src/frontend/features"),
      "@entities": path.resolve(__dirname, "./src/frontend/entities"),
      "@shared": path.resolve(__dirname, "./src/frontend/shared"),
      "@assets": path.resolve(__dirname, "./src/frontend/assets"),
    },
  },
});
