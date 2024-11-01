import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '@spectrum-web-components/theme/theme-darkest.js';
import '@spectrum-web-components/theme/scale-medium.js';
import '@spectrum-web-components/theme/sp-theme.js';

import './editor/image-editor.js';

@customElement('web-image-editor')
export class CorpRoot extends LitElement {
  @property({ type: String }) header = 'My app';

  static styles = css`
    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: calc(10px + 2vmin);
      color: #1a2b42;
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
      background-color: var(--corp-root-background-color);
    }

    main {
      flex-grow: 1;
    }

    .logo {
      margin-top: 36px;
      animation: app-logo-spin infinite 20s linear;
    }

    @keyframes app-logo-spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .app-footer {
      font-size: calc(12px + 0.5vmin);
      align-items: center;
    }

    .app-footer a {
      margin-left: 5px;
    }
  `;

  render() {
    return html`
      <main>
        <corp-image-editor></corp-image-editor>
      </main>

      <p class="app-footer">
        Made with love by
        <a target="_blank" rel="noopener noreferrer" href="https://luixaviles.com"
          >@luixaviles</a
        >.
      </p>
    `;
  }
}
