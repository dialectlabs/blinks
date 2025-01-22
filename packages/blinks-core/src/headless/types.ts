export type Provider = {
  name: string;
  icon?: string;
};

export type BlinkContext = {
  url: string;
  websiteUrl?: string;
  category?: string;
  provider?: Provider;
};

export type BlinkPreview = {
  image: string;
  title: string;
  description: string;
  cta?: string;
  context: BlinkContext;
};
