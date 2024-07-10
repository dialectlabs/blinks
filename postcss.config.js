let prefixOverrideList = ['html', 'body'];

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-prefix-selector': {
      prefix: '.blink',
      includeFiles: ['index.css'],
      transform: function (prefix, selector, prefixedSelector) {
        if (selector.startsWith('.blink')) {
          return selector;
        }
        if (prefixOverrideList.includes(selector)) {
          return prefix;
        } else {
          return prefixedSelector;
        }
      },
    },
  },
};
