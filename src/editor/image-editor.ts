import { LitElement, html, css } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';

import { Cloudinary } from '@cloudinary/url-gen';
import { backgroundRemoval } from '@cloudinary/url-gen/actions/effect';
import { source } from '@cloudinary/url-gen/actions/underlay';
import { image } from '@cloudinary/url-gen/qualifiers/source';
import { Position } from '@cloudinary/url-gen/qualifiers/position';
import { compass } from '@cloudinary/url-gen/qualifiers/gravity';

import '@spectrum-web-components/dropzone/sp-dropzone.js';
import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/toast/sp-toast.js';
import '@spectrum-web-components/accordion/sp-accordion.js';
import '@spectrum-web-components/accordion/sp-accordion-item.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/color-slider/sp-color-slider.js';
import '@spectrum-web-components/illustrated-message/sp-illustrated-message.js';
import '@spectrum-web-components/picker/sp-picker.js';
import '@spectrum-web-components/menu/sp-menu-item.js';
import '@spectrum-web-components/progress-bar/sp-progress-bar.js';
import type { ColorSlider } from '@spectrum-web-components/color-slider';

import './light-controls.js';
import './canvas-editor.js';

import { defaultFilterConfig, FilterConfig } from './filter-config.js';
import { SceneryKey } from './scenery.js';
// eslint-disable-next-line import/no-duplicates
import { CanvasEditor } from './canvas-editor.js';

const sceneryOptions = {
  beach: 'docs/bg_beach_sq',
  space: 'docs/bg_space_sq',
};

// Create an account on Cloudinary and set your Cloud name here:
const cloudName = 'cloudname';
const cloudinary = new Cloudinary({
  cloud: {
    cloudName,
  },
});

@customElement('corp-image-editor')
export class CorpImageEditor extends LitElement {
  static styles = css`
    .container-editor {
      padding: 1em;
      background-color: var(--spectrum-gray-100);
      color: var(--spectrum-gray-800);
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
    }

    sp-dropzone {
      border: 1px solid gray;
      overflow: hidden;
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      min-width: 500px;
      min-height: 500px;
    }

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

  @query('sp-dropzone') dropzone!: HTMLElement;
  @state() private imageUrl: string | null = null;
  @state() private filterConfig: FilterConfig = { ...defaultFilterConfig };
  @state() private saveSuccessful = false;
  @state() private fileHandle: FileSystemFileHandle | null = null;
  @state() private inProgress = false;
  @query('corp-canvas-editor') canvasEditor!: CanvasEditor;
  private imagePublicId: string | null = null;

  firstUpdated() {
    this.dropzone.addEventListener('drop', this.handleDrop);
    this.dropzone.addEventListener('dragover', this.handleDragOver);
  }

  disconnectedCallback() {
    this.dropzone.removeEventListener('drop', this.handleDrop);
    this.dropzone.removeEventListener('dragover', this.handleDragOver);
    super.disconnectedCallback();
  }

  private handleDragOver(event: Event) {
    event.preventDefault();
  }

  private handleFilterConfigChange(event: CustomEvent<FilterConfig>) {
    this.filterConfig = { ...event.detail };
  }

  private handleDrop = (event: Event) => {
    event.preventDefault();
    this.filterConfig = { ...defaultFilterConfig };
    const dropzoneEvent = event as DragEvent;
    const file = dropzoneEvent.dataTransfer?.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      this.imageUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  private resetConfig() {
    this.filterConfig = { ...defaultFilterConfig };
  }

  private async handleSaveAs() {
    const { canvas } = this.canvasEditor;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();
    const options = {
      suggestedName: 'image.png',
      types: [
        {
          description: 'PNG Files',
          accept: {
            'image/png': ['.png'],
          },
        },
      ],
    };

    try {
      // @ts-ignore
      this.fileHandle = await window.showSaveFilePicker(options);
      // @ts-ignore
      const writable = await this.fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (error) {
      console.error('Save As operation failed:', error);
    }
  }

  private async handleSave() {
    const { canvas } = this.canvasEditor;

    this.saveSuccessful = false;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();

    if (this.fileHandle) {
      const writable = await this.fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      this.saveSuccessful = true;
    } else {
      console.error('No file handle available.');
    }
  }

  private async handleBackgroundRemoval() {
    const { canvas } = this.canvasEditor;

    if (!canvas) return;

    this.inProgress = true;
    const dataUrl = canvas.toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();

    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', 'preset'); // Preset configuration to enable remove the background

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload/`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const data = await response.json();
      if (data.secure_url) {
        this.imagePublicId = data.public_id;
        this.applyBackgroundRemoval();
      } else {
        console.error('Upload failed:', data);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

  private async applyBackgroundRemoval() {
    if (!this.imagePublicId) {
      return;
    }

    const imageUrl = cloudinary
      .image(this.imagePublicId)
      .effect(backgroundRemoval())
      .toURL();

    const imageLoader = async (url: string) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          this.imageUrl = url;
          this.inProgress = false;
        } else {
          setTimeout(() => {
            imageLoader(url);
          }, 2000);
        }
      } catch (error) {
        console.error('Error on downloading image', error);
      }
    };

    await imageLoader(imageUrl);
  }

  private async handleScenery(scenery: SceneryKey) {
    if (!this.imagePublicId) {
      return;
    }

    this.imageUrl = cloudinary
      .image(this.imagePublicId)
      .underlay(
        source(image(sceneryOptions[scenery])).position(
          new Position().gravity(compass('south')),
        ),
      )
      .toURL();
  }

  private async handleBackgroundColor(event: Event & { target: ColorSlider }) {
    if (!this.imagePublicId) {
      return;
    }

    const color = event.target.color as string;
    this.imageUrl = cloudinary
      .image(this.imagePublicId)
      .backgroundColor(`#${color}`)
      .toURL();
  }

  render() {
    return html`
      <sp-theme color="darkest" scale="medium">
        ${this.saveSuccessful
          ? html`
              <sp-toast open variant="info">
                The image file has been updated.
              </sp-toast>
            `
          : ''}

        <div class="container-editor">
          <div class="canvas-editor" style="display:flex;flex-direction:column">
            ${this.inProgress
              ? html`
                  <sp-progress-bar
                    style="width:auto;"
                    aria-label="Loaded an unclear amount"
                    indeterminate
                  ></sp-progress-bar>
                `
              : ''}
            <sp-dropzone>
              ${!this.imageUrl
                ? html`
                    <sp-illustrated-message heading="Drag and drop your file">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 150 103"
                        width="150"
                        height="103"
                      >
                        <path
                          d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z"
                        ></path>
                      </svg>
                    </sp-illustrated-message>
                  `
                : html`
                    <corp-canvas-editor
                      .imageUrl=${this.imageUrl}
                      .filterConfig=${this.filterConfig}
                    ></corp-canvas-editor>
                  `}
            </sp-dropzone>
          </div>
          <div class="controls">
            <sp-action-group size="m">
              <sp-action-button @click=${this.resetConfig}
                >Reset</sp-action-button
              >
              <sp-action-button
                @click=${this.handleSave}
                .disabled=${this.fileHandle === null}
                >Save</sp-action-button
              >
              <sp-action-button @click=${this.handleSaveAs}
                >Save As...</sp-action-button
              >
            </sp-action-group>

            <sp-accordion size="s" allow-multiple>
              <sp-accordion-item open label="Light Controls">
                <corp-light-controls
                  .filterConfig=${this.filterConfig}
                  @filter-config-change=${this.handleFilterConfigChange}
                ></corp-light-controls>
              </sp-accordion-item>
              <sp-accordion-item open label="Background Controls">
                <sp-action-group emphasized quiet id="standard">
                  <sp-action-button
                    emphasized
                    quiet
                    .disabled=${this.imageUrl === null}
                    @click=${this.handleBackgroundRemoval}
                    >Remove Background</sp-action-button
                  >
                </sp-action-group>

                <div
                  style="display:flex; flex-direction:row;align-items:center;padding:1em"
                >
                  <sp-field-label
                    for="color-slider"
                    side-aligned="start"
                    style="width: 50px"
                    >Color</sp-field-label
                  >
                  <sp-color-slider
                    id="color-slider"
                    @change=${this.handleBackgroundColor}
                  ></sp-color-slider>
                </div>
                <div
                  style="display:flex; flex-direction:row;align-items:center;padding:1em"
                >
                  <sp-field-label side-aligned="start" style="width: 50px"
                    >Scenery</sp-field-label
                  >
                  <sp-picker size="m" label="Scenery">
                    <sp-menu-item @click=${() => this.handleScenery('beach')}
                      >Beach</sp-menu-item
                    >
                    <sp-menu-item @click=${() => this.handleScenery('space')}
                      >Space</sp-menu-item
                    >
                  </sp-picker>
                </div>
              </sp-accordion-item>
            </sp-accordion>
          </div>
        </div>
      </sp-theme>
    `;
  }
}
