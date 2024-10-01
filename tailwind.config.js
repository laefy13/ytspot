/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],

  theme: {
    extend: {
      spacing: {
        30: "7.5rem",
      },
      animation: {
        marquee: "marquee 10s linear infinite",
        marquee2: "marquee2 10s linear infinite",
        fadeIn: "fadeIn 2s ease-in-out",
        fadeOut: "fadeOut 2s ease-in-out ",
        showController: "showController 1s ease-in-out",
        hideController: "hideController 1s ease-in-out ",
        showButton: "showButton 1s ease-in-out",
        hideButton: "hideButton 1s ease-in-out ",
        showSearchContainer: "showSearchContainer .3s ease-in-out",
        hideSearchContainer: "hideSearchContainer .3s ease-in-out",
        mobileShowSearchContainer: "mobileShowSearchContainer .3s ease-in-out",
        mobileHideSearchContainer: "mobileHideSearchContainer .3s ease-in-out",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        marquee2: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        },
        fadeOut: {
          "0%": { height: "30vh" },
          "100%": { height: "50px" },
        },
        fadeIn: {
          "0%": { height: "50px" },
          "100%": { height: "30vh" },
        },
        hideController: {
          "0%": { width: "50%" },
          "100%": { width: "16.666667%" },
        },
        showController: {
          "0%": { width: "16.666667%" },
          "100%": { width: "50%" },
        },
        hideButton: {
          "0%": { visibility: "visible" },
          "100%": { visibility: "hidden" },
        },
        showButton: {
          "0%": { visibility: "hidden" },
          "100%": { visibility: "show" },
        },
        hideSearchContainer: {
          "0%": { transform: "translateX(0vw)" },
          "100%": { transform: "translateX(-21vw)" },
        },
        showSearchContainer: {
          "0%": { transform: "translateX(-20vw)" },
          "100%": { transform: "translateX(0vw)" },
        },
        mobileHideSearchContainer: {
          "0%": { transform: "translateX(0vw)" },
          "100%": { transform: "translateX(-100vw)" },
        },
        mobileShowSearchContainer: {
          "0%": { transform: "translateX(-100vw)" },
          "100%": { transform: "translateX(0vw)" },
        },
      },
      height: {
        "10per": "10%",
        "8per": "8%",
        50: "50px",
        "30vh": "30vh",
        "50vh": "50vh",
      },
      width: {
        "3/5": "60%",
        "30vw": "30vw",
        "20%": "20%",
        "10%": "10%",
        "20vw": "20vw",
        "100vw": "100vw",
      },
      colors: {
        darkgreen: "#19282F",
        lightgreen: "#D3ECA7",
        red: "#B33030",
        green: "#A1B57D",
        transparent: "transparent",
        black: "#00000",
      },
    },
  },
  plugins: [],
};
