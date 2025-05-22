 import { defineConfig } from "vite" import vue from "@vitejs/plugin-vue" import path from "path" import { visualizer } from "rollup-plugin-visualizer"

export default defineConfig(({ mode }) => { const isProd = mode === "production"

return { plugins: [ vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.includes("-"), }, }, }), mode === "analyze" && visualizer({ open: true, filename: "dist/stats.html", gzipSize: true, brotliSize: true, }), ].filter(Boolean),

resolve: {
  alias: {
    "@": path.resolve(__dirname, "src"),
  },
},

css: {
  devSourcemap: true,
  postcss: {
    plugins: [require("autoprefixer"), require("tailwindcss")],
  },
},

optimizeDeps: {
  exclude: ["firebase/auth", "firebase/app", "firebase/firestore"],
  // Actualizado para Vite 5.x
  include: ["vue", "vue-router", "pinia", "@stripe/stripe-js", "axios", "date-fns", "lodash-es"],
},

build: {
  sourcemap: !isProd,
  cssCodeSplit: true,
  minify: isProd ? "terser" : false,
  terserOptions: isProd
    ? {
        compress: {
          drop_console: true,
        },
      }
    : undefined,
  rollupOptions: {
    output: {
      manualChunks: {
        firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
        "vue-vendor": ["vue", "vue-router", "pinia"],
        ui: ["@/components/ui"],
        three: ["three"],
      },
    },
  },
},

server: {
  port: 3000,
  open: true,
  host: true,
  proxy: {
    "/api": {
      target: "http://localhost:8000",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ""),
    },
  },
},
} })