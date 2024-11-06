export const confirmLinkTransition = (url: string) => {
  return window.confirm(
    `This action redirects to another website: ${url}, the link will open in a new tab of your browser`,
  );
};
