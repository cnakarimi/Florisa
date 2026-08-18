export interface HomeSlide {
  id: number;
  eyebrow: string;
  title: string;
  description: string;
  mobile_image_url: string;
  desktop_image_url: string;
  image_alt: string;
  cta_label: string;
  cta_url: string;
}

export type HomeSlidesStatus = "loading" | "ready" | "error";
