export interface HomeSlide {
  id: number;
  title: string;
  mobile_image_url: string;
  desktop_image_url: string;
  image_alt: string;
  cta_label: string;
  cta_url: string;
  buttonBackgroundColor: string;
  buttonTextColor: string;
  titleTextColor: string;
}

export type HomeSlidesStatus = "loading" | "ready" | "error";
