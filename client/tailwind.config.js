/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        hex: "url('/src/assets/hex.jpg')",
        norm: "url('/src/assets/norm.jpg')",
        new: "url('/src/assets/new.jpg')",
        banner: "url('/src/assets/banner.jpg')",
        banner2: "url('/src/assets/banner2.jpg')",
      },
      fontFamily: {
        montserrat: ["Allerta", "sans-serif"],
        opensans: ["Open Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
