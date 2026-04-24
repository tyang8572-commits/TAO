import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8f1",
          100: "#d4ecd8",
          500: "#1f7a45",
          600: "#17663a",
          700: "#11502d"
        },
        ink: "#14213d",
        sand: "#fff9ef"
      },
      boxShadow: {
        card: "0 18px 40px rgba(20, 33, 61, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
