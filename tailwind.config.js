/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      "cupcake",
      "garden",
      "aqua",
      "winter",
      "synthwave",
      "cmyk",
      "emerald",
      "business",
      "dark",
      "cyberpunk",
    ],
  },
};
