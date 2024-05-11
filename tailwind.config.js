/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],

  theme: {
    extend: {
      animation: {
        marquee: "marquee 10s linear infinite",
        marquee2: "marquee2 10s linear infinite",
        fadeIn: "fadeIn 2s ease-in-out",
        fadeOut: "fadeOut 2s ease-in-out ",
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
        "1/2": "50vw",
        "30vw": "30vw",
        "20%": "20%",
        "10%": "10%",
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
