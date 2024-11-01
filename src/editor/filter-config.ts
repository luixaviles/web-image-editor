export type FilterConfig = {
  brightness: number;
  contrast: number;
  grayscale: number;
  opacity: number;
  invert: number;
  saturation: number;
  sepia: number;
};

export const defaultFilterConfig: FilterConfig = {
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  opacity: 100,
  invert: 0,
  saturation: 100,
  sepia: 0,
};