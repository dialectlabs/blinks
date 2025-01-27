export interface BlinkProvider {
  name: string;
  icon?: string;
}

export interface BlinkContext {
  url: string;
  websiteUrl?: string;
  category?: string;
  provider?: BlinkProvider;
}

export interface BlinkPreview {
  image: string;
  title: string;
  description: string;
  cta?: string;
  context: BlinkContext;
}
