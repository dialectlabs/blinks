let prefixOverrideList = ['html', 'body'];
const selectorIgnoreList = [
  '.blink',
  '.x-dark',
  '.x-light',
  '.dial-light',
  '.custom',
];

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-prefix-selector': {
      prefix: '.blink',
      includeFiles: ['index.css'],
      transform: function (prefix, selector, prefixedSelector) {
        const shouldIgnore =
          selectorIgnoreList.filter((ignore) => selector.startsWith(ignore))
            .length > 0;
        if (shouldIgnore) {
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
