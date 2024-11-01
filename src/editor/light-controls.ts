import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import { defaultFilterConfig, FilterConfig } from './filter-config.js';

import '@spectrum-web-components/slider/sp-slider.js';

@customElement('corp-light-controls')
export class LightControls extends LitElement {
  static styles = css`
    .controls {
      width: 300px;
      padding: 1em;
      border-left: 1px solid gray;
      display: flex;
      flex-direction: column;
      gap: 10px;
      text-align: left;
    }
  `;

  @property({ type: Object }) filterConfig!: FilterConfig;

  private readonly defaultFilterConfig = defaultFilterConfig;

  private handleConfigChange(event: Event, filter: keyof FilterConfig) {
    this.filterConfig[filter] = parseInt(
      (event.target as HTMLInputElement).value,
      10,
    );
    this.dispatchEvent(new CustomEvent('filter-config-change', { detail: this.filterConfig }));
  }

  render() {
    return html`
      <sp-slider
        label="Brightness"
        format-options='{
                    "style": "unit",
                    "unit": "%"
                }'
        min="0"
        max="200"
        .value=${live(this.filterConfig.brightness)}
        fill-start=${this.defaultFilterConfig.brightness}
        @change=${(event: Event) =>
          this.handleConfigChange(event, 'brightness')}
      ></sp-slider>
      <sp-slider
        label="Contrast"
        format-options='{
                    "style": "unit",
                    "unit": "%"
                }'
        min="0"
        max="200"
        .value=${live(this.filterConfig.contrast)}
        fill-start=${this.defaultFilterConfig.contrast}
        @change=${(event: Event) => this.handleConfigChange(event, 'contrast')}
      ></sp-slider>
      <sp-slider
        label="Grayscale"
        format-options='{
                    "style": "unit",
                    "unit": "%"
                }'
        min="0"
        max="100"
        .value=${live(this.filterConfig.grayscale)}
        fill-start=${this.defaultFilterConfig.grayscale}
        @change=${(event: Event) => this.handleConfigChange(event, 'grayscale')}
      ></sp-slider>
      <sp-slider
        label="Opacity"
        format-options='{
                    "style": "unit",
                    "unit": "%"
                }'
        min="0"
        max="100"
        .value=${live(this.filterConfig.opacity)}
        fill-start=${this.defaultFilterConfig.opacity}
        @change=${(event: Event) => this.handleConfigChange(event, 'opacity')}
      ></sp-slider>
      <sp-slider
        label="Invert"
        format-options='{
                    "style": "unit",
                    "unit": "%"
                }'
        min="0"
        max="100"
        .value=${live(this.filterConfig.invert)}
        fill-start=${this.defaultFilterConfig.invert}
        @change=${(event: Event) => this.handleConfigChange(event, 'invert')}
      ></sp-slider>
      <sp-slider
        label="Saturation"
        format-options='{
                    "style": "unit",
                    "unit": "%"
                }'
        min="0"
        max="100"
        .value=${live(this.filterConfig.saturation)}
        fill-start=${this.defaultFilterConfig.saturation}
        @change=${(event: Event) =>
          this.handleConfigChange(event, 'saturation')}
      ></sp-slider>
      <sp-slider
        label="Sepia"
        format-options='{
                    "style": "unit",
                    "unit": "%"
                }'
        min="0"
        max="100"
        .value=${live(this.filterConfig.sepia)}
        fill-start=${this.defaultFilterConfig.sepia}
        @change=${(event: Event) => this.handleConfigChange(event, 'sepia')}
      ></sp-slider>
    `;
  }
}
