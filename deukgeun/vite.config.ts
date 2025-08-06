import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  // 환경 변수 로드 (프로젝트 루트와 src/frontend 디렉토리에서)
  const env = loadEnv(mode, process.cwd(), "");
  const frontendEnv = loadEnv(
    mode,
    path.resolve(process.cwd(), "src/frontend"),
    ""
  );

  // 환경 변수 병합 (frontend가 우선)
  const mergedEnv = { ...env, ...frontendEnv };

  return {
    plugins: [react()],
    server: {
      port: process.env.FRONTEND_PORT
        ? parseInt(process.env.FRONTEND_PORT)
        : 5173,
      host: true,
      strictPort: false,
      proxy: {
        "/api": {
          target: process.env.VITE_BACKEND_URL || "http://localhost:5000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "/api"),
        },
      },
    },
    assetsInclude: ["*.mp4"],
    optimizeDeps: {
      exclude: ["*.mp4"],
    },
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
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
      },
      outDir: "dist",
      emptyOutDir: true,
    },
    esbuild: {
      exclude: ["**/*.js", "**/*.jsx"],
    },
    define: {
      // 환경 변수를 클라이언트에서 사용할 수 있도록 정의
      "import.meta.env.VITE_LOCATION_JAVASCRIPT_MAP_API_KEY": JSON.stringify(
        mergedEnv.VITE_LOCATION_JAVASCRIPT_MAP_API_KEY
      ),
      "import.meta.env.VITE_LOCATION_REST_MAP_API_KEY": JSON.stringify(
        mergedEnv.VITE_LOCATION_REST_MAP_API_KEY
      ),
      "import.meta.env.VITE_GYM_API_KEY": JSON.stringify(
        mergedEnv.VITE_GYM_API_KEY
      ),
      "import.meta.env.VITE_BACKEND_URL": JSON.stringify(
        mergedEnv.VITE_BACKEND_URL
      ),
      "import.meta.env.VITE_RECAPTCHA_SITE_KEY": JSON.stringify(
        mergedEnv.VITE_RECAPTCHA_SITE_KEY
      ),
    },
  };
});
