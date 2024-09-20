export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    screens: {
      xsm: '425px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    colors: {
      transparent: 'transparent',
      input: {
        checked: '#09CBBF',
        disabled: '#D7D7D7',
        primary: '#DEE1E7',
        secondary: '#FFFFFF',
        unchecked: '#D7D7D7',
        inverse: '#232324',
        'inverse-hover': '#323335',
      },
      icon: {
        tertiary: '#B3B3B3',
      },
      dark: {
        90: '#232324',
      },
      blink: {
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
    extend: {
      colors: {
        primary: '#FFFFFF',
        button: {
          primary: '#2A2A2B',
          'primary-disabled': '#656564',
          secondary: '#EBEBEB',
        },
        accent: {
          success: '#08C0B4',
          error: {
            DEFAULT: '#F62D2D',
            lighter: '#FF7373',
          },
          warning: {
            DEFAULT: '#ff9900',
            lighter: '#ffb23d',
          },
        },
        stroke: {
          primary: '#DEE1E7',
        },
      },
      textColor: {
        primary: '#232324',
        secondary: '#434445',
        tertiary: '#737373',
        quaternary: '#888989',
        inverse: '#FFFFFF',
      },
      backgroundColor: {
        secondary: '#F9F9F9',
      },
      backgroundImage: {
        'gradient-button':
          'linear-gradient(95deg, #2B2D2D 4.07%, #4B4D4E 51.31%, #2B2D2D 95.93%)',
        'gradient-wallet-button':
          'linear-gradient(95deg, #232324 4.07%, #323335 50%, #232324 95.93%)',
        'gradient-background':
          'radial-gradient(80.53% 72.48% at 50% 47.53%, #FFF 0%, #EAEBEB 100%)',
      },
      boxShadow: {
        action:
          '0px 129.333px 103.467px 0px rgba(0, 0, 0, 0.07), 0px 54.032px 43.226px 0px rgba(0, 0, 0, 0.05), 0px 16.195px 12.956px 0px rgba(0, 0, 0, 0.04), 0px 8.601px 6.881px 0px rgba(0, 0, 0, 0.03), 0px 3.579px 2.863px 0px rgba(0, 0, 0, 0.02)',
        'action-lighter':
          '0px 8.601px 6.881px 0px rgba(0, 0, 0, 0.03), 0px 3.579px 2.863px 0px rgba(0, 0, 0, 0.02)',
      },
      fontSize: {
        h1: [
          '3rem',
          {
            fontWeight: 400,
            lineHeight: '3.5rem',
          },
        ],
        highlight: [
          '1.5rem',
          {
            fontWeight: 400,
            lineHeight: '2rem',
          },
        ],
        h2: [
          '1.063rem',
          {
            fontWeight: 400,
            lineHeight: '1.25rem',
          },
        ],
        'title-2': [
          '2.25rem',
          {
            fontWeight: 400,
            lineHeight: '2.5rem',
          },
        ],
        text: [
          '0.938rem',
          {
            fontWeight: 400,
            lineHeight: '1.125rem',
          },
        ],
        subtext: [
          '0.813rem',
          {
            fontWeight: 400,
            lineHeight: '1rem',
          },
        ],
        button: [
          '0.938rem',
          {
            fontWeight: 400,
            lineHeight: '1.25rem',
          },
        ],
        caption: [
          '0.688rem',
          {
            fontWeight: 400,
            lineHeight: '0.875rem',
          },
        ],
      },
    },
  },
  plugins: [],
};
