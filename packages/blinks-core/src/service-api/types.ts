export interface Provider {
  name: string;
  icon?: string;
}

export interface BlinkContext {
  url: string;
  websiteUrl?: string;
  category?: string;
  provider?: Provider;
}

export interface BlinkPreview {
  image: string;
  title: string;
  description: string;
  cta?: string;
  context: BlinkContext;
}
