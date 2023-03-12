/*
    Copyright (c) 2022 Alethea Katherine Flowers.
    Published under the standard MIT License.
    Full text available at: https://opensource.org/licenses/MIT
*/

import { CustomElement, html } from "../dom/custom-elements";
import { KiCanvasLoadEvent } from "../framework/events";
import type { KicadSch } from "../schematic/items";
import { SchematicViewer } from "../schematic/viewer";

export class KiCanvasSchematicElement extends CustomElement {
    #canvas: HTMLCanvasElement;
    viewer: SchematicViewer;
    selected: any[] = [];

    get loaded() {
        return this.getBooleanAttribute("loaded");
    }

    set loaded(value) {
        const old = this.loaded;
        this.setBooleanAttribute("loaded", value);
        if (value == true && !old) {
            this.dispatchEvent(new KiCanvasLoadEvent());
        }
    }

    override initialContentCallback() {
        this.viewer = new SchematicViewer(this.#canvas);
        this.viewer.addEventListener(KiCanvasLoadEvent.type, () => {
            this.loaded = true;
        });
    }

    override disconnectedCallback() {
        this.viewer?.dispose();
        this.selected = [];
    }

    async load(src: KicadSch) {
        await this.viewer.setup();
        await this.viewer.load(src);

        this.loaded = true;

        this.viewer.draw();
    }

    override render() {
        this.#canvas = html`<canvas></canvas>` as HTMLCanvasElement;

        return html`<style>
                :host {
                    display: block;
                    touch-action: none;
                }

                canvas {
                    width: 100%;
                    height: 100%;
                }
            </style>
            ${this.#canvas}`;
    }
}

window.customElements.define("kicanvas-schematic", KiCanvasSchematicElement);
