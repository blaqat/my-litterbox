import typography from "@tailwindcss/typography";
import prismjs from "prismjs";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte,md,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [typography, prismjs],
};
