import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { defaultFilterConfig, FilterConfig } from './filter-config.js';

@customElement('corp-canvas-editor')
export class CanvasEditor extends LitElement {
  static styles = css``;

  @property({ type: String }) imageUrl!: string | null;

  @property({ type: Object }) filterConfig: FilterConfig = {
    ...defaultFilterConfig,
  };

  @query('canvas') canvas!: HTMLCanvasElement;

  private width = 500;
  private height = 500;

  private async loadImageUrl() {
    if (!this.imageUrl || !this.canvas) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const context = this.canvas.getContext('2d');
      if (!context) {
        return;
      }
      // Set canvas dimensions to match the image
      const maxWidth = 500;
      const maxHeight = 500;

      const aspectRatio = img.width / img.height;
      let canvasWidth = maxWidth;
      let canvasHeight = maxHeight;

      if (aspectRatio > 1) {
        canvasWidth = Math.min(maxWidth, canvasWidth);
        canvasHeight = canvasWidth / aspectRatio;
      } else {
        canvasHeight = Math.min(maxHeight, canvasHeight);
        canvasWidth = canvasHeight * aspectRatio;
      }

      this.canvas.width = canvasWidth;
      this.canvas.height = canvasHeight;
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      context.filter = `brightness(${this.filterConfig.brightness}%) 
                        contrast(${this.filterConfig.contrast}%)
                        grayscale(${this.filterConfig.grayscale}%)
                        opacity(${this.filterConfig.opacity}%)
                        invert(${this.filterConfig.invert}%)
                        saturate(${this.filterConfig.saturation}%)
                        sepia(${this.filterConfig.sepia}%)
                        `;
      context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    };

    img.src = this.imageUrl;
  }

  render() {
    return this.imageUrl
      ? html` <canvas width=${this.width} height=${this.height}></canvas> `
      : '';
  }

  updated(changedProperties: Map<string, unknown>) {
    if (
      changedProperties.has('imageUrl') ||
      changedProperties.has('filterConfig')
    ) {
      this.loadImageUrl();
    }

    super.update(changedProperties);
  }
}
