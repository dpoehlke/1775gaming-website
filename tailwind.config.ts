import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        scarlet: "#CC0000",
        "marine-black": "#0D0D0D",
        gold: "#B8860B",
        charcoal: "#1A1A1A",
        silver: "#C0C0C0",
      },
      fontFamily: {
        heading: ["var(--font-bebas-neue)", "sans-serif"],
        body: ["var(--font-ibm-plex-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
