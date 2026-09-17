import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#18221e", moss: "#1e6b51", mint: "#dff6e9", cream: "#f7f8f4" },
      boxShadow: { soft: "0 18px 45px rgba(19, 42, 31, .10)" },
    },
  },
  plugins: [],
} satisfies Config;
