import { defineConfig } from "vite";

export default defineConfig({
    build: {
        emptyOutDir: false,
        rollupOptions: {
            input: {
                main: "app.js",
            },
            output: {
                entryFileNames: "[name].min.js",
                format: "iife",
                dir: "assets",
            },
        },
    },
});
