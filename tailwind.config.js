/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      'bg-primary': 'var(--blink-bg-primary)',
      button: 'var(--blink-button)',
      'button-disabled': 'var(--blink-button-disabled)',
      'button-hover': 'var(--blink-button-hover)',
      'icon-error': 'var(--blink-icon-error)',
      'icon-error-hover': 'var(--blink-icon-error-hover)',
      'icon-primary': 'var(--blink-icon-primary)',
      'icon-primary-hover': 'var(--blink-icon-primary-hover)',
      'icon-warning': 'var(--blink-icon-warning)',
      'icon-warning-hover': 'var(--blink-icon-warning-hover)',
      'stroke-brand': 'var(--blink-stroke-brand)',
      'stroke-error': 'var(--blink-stroke-error)',
      'stroke-primary': 'var(--blink-stroke-primary)',
      'stroke-secondary': 'var(--blink-stroke-secondary)',
      'stroke-warning': 'var(--blink-stroke-warning)',
      'text-brand': 'var(--blink-text-brand)',
      'text-button': 'var(--blink-text-button)',
      'text-error': 'var(--blink-text-error)',
      'text-error-hover': 'var(--blink-text-error-hover)',
      'text-hover': 'var(--blink-text-hover)',
      'text-primary': 'var(--blink-text-primary)',
      'text-secondary': 'var(--blink-text-secondary)',
      'text-success': 'var(--blink-text-success)',
      'text-tertiary': 'var(--blink-text-tertiary)',
      'text-warning': 'var(--blink-text-warning)',
      'text-warning-hover': 'var(--blink-text-warning-hover)',
      'transparent-error': 'var(--blink-transparent-error)',
      'transparent-grey': 'var(--blink-transparent-grey)',
      'transparent-warning': 'var(--blink-transparent-warning)',
      transparent: 'transparent',
    },
    extend: {
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
