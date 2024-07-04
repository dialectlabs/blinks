/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blink: {
          neutral: {
            80: '#202327',
            70: '#2f3336',
            50: '#6E767D',
            40: '#C4C4C4',
          },
          accent: {
            DEFAULT: '#1d9bf0',
            darker: '#428cd2',
          },
          success: '#09CBBF',
          error: {
            DEFAULT: '#FF402E',
            lighter: '#FF9696',
          },
          warning: {
            DEFAULT: '#EF6F08',
            lighter: '#FFBC6E',
          },
        },
      },
      fontSize: {
        // assuming twitter font size base - 15px
        text: ['1rem', '1.2rem'],
        subtext: ['0.867rem', '1.067rem'],
        caption: ['0.73333rem', '0.93333rem'],
      },
      boxShadow: {
        action:
          '0px 2px 8px 0px rgba(59, 176, 255, 0.22), 0px 1px 48px 0px rgba(29, 155, 240, 0.32)',
      },
    },
  },
  plugins: [],
};
