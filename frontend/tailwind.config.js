module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      white: '#ffffff',
      black: '#000000',
      gray: {
        50:   '#fafafa',
        100:  '#f5f5f5',
        200:  '#e5e5e5',
        300:  '#d4d4d4',
        400:  '#a3a3a3',
        500:  '#737373',
        600:  '#525252',
        700:  '#2d2d2d',
        800:  '#1a1a1a',
        900:  '#0f0f0f',
      },
      blue: {
        400:  '#60a5fa',
        500:  '#4a9fff',
        600:  '#1e5fdb',
        700:  '#1d4ed8',
      },
      green: {
        400:  '#4ade80',
        600:  '#15803d',
      },
      amber: {
        500:  '#f59e0b',
        600:  '#b45309',
      },
      red: {
        500:  '#ef4444',
        600:  '#dc2626',
      },
      cyan: {
        600:  '#0891b2',
      },
    },
    fontFamily: {
      sans: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        '"Helvetica Neue"',
        'sans-serif',
      ],
      mono: [
        '"JetBrains Mono"',
        '"Courier New"',
        'monospace',
      ],
    },
    extend: {
      fontSize: {
        11: '11px',
        12: '12px',
        13: '13px',
        14: '14px',
        16: '16px',
        18: '18px',
        20: '20px',
        24: '24px',
        28: '28px',
        32: '32px',
        48: '48px',
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
    },
  },
  plugins: [],
};
