// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  output: "server",
  adapter: cloudflare(),
  site: "https://blaqat.net",
  vite: {
    plugins: [tailwindcss()],
  },
});
