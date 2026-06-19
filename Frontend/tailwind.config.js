/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist"', "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "Menlo", "Consolas", "monospace"],
      },
      colors: {
        // 暖纸面色板
        paper: {
          50: "#fbfaf7",
          100: "#f8f8f6",
          200: "#efeeeb",
          300: "#d7d7d4",
          400: "#c7c5bd",
        },
        // 深墨色文字
        ink: {
          950: "#211e18",
          900: "#2b2820",
          850: "#322f27",
          800: "#3f3a31",
          700: "#514c40",
          650: "#625d50",
          600: "#6a6558",
          500: "#73705f",
          400: "#96917f",
          350: "#aaa592",
          300: "#bab5a6",
          200: "#d7d7d4",
          100: "#e6e5e1",
          50: "#f1f0ec",
        },
        // 焦土橘——唯一强调色
        terra: {
          50: "#fbf2ed",
          100: "#f1dccf",
          200: "#e7bda8",
          300: "#d89474",
          400: "#c2694a",
          500: "#b45d40",
          600: "#a8573b",
          700: "#7d3f2a",
        },
        // 苔绿——完成态
        moss: {
          50: "#f0f3eb",
          100: "#dbe2cb",
          400: "#7d9866",
          500: "#5a7d4c",
          600: "#456239",
        },
        // 暖棕——进行中状态，避免误读成错误
        umber: {
          50: "#f7f0e4",
          100: "#eadcc5",
          200: "#d2ba8d",
          500: "#8a6a3f",
          600: "#705632",
        },
        // 砖红——错误（柔和警告色，参考 Claude Code）
        brick: {
          50: "#fef6ee",   // 极浅琥珀橙
          100: "#fde8d7",  // 浅琥珀橙
          200: "#fac9a4",  // 柔和橙
          500: "#d97706",  // 琥珀橙（主色）
          600: "#b45309",  // 深琥珀橙
          700: "#92400e",  // 更深琥珀橙（高对比度）
        },
      },
      boxShadow: {
        "bubble-user": "0 1px 1px rgba(43, 40, 32, 0.04)",
        "bubble-ai": "0 1px 2px rgba(43, 40, 32, 0.04), 0 8px 24px -18px rgba(43, 40, 32, 0.16)",
        "panel": "0 0 0 1px rgba(43, 40, 32, 0.055)",
        "soft": "0 10px 28px -18px rgba(43, 40, 32, 0.22)",
      },
      animation: {
        "caret": "caret 1.1s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.18s ease-out both",
        // Dialog content must not animate transform, otherwise it overrides Tailwind translate centering.
        "dialog-in": "dialogIn 0.16s ease-out both",
        "dialog-out": "dialogOut 0.12s ease-in both",
      },
      keyframes: {
        caret: {
          "0%, 50%": { opacity: "1" },
          "50.01%, 100%": { opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        dialogIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        dialogOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
