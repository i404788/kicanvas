/*
    Copyright (c) 2023 Alethea Katherine Flowers.
    Published under the standard MIT License.
    Full text available at: https://opensource.org/licenses/MIT
*/

import { CustomElement, html } from "../dom/custom-elements";
import { SchematicSymbol } from "../schematic/items";
import styles from "./kicanvas-dialog.css";

export class KiCanvasDialogElement extends CustomElement {
    static override styles = styles;
    #selected: SchematicSymbol;

    constructor() {
        super();
    }

    override connectedCallback() {
        super.connectedCallback();

        // TODO: Fix this to use new event stuff
        // window.addEventListener(
        //     KiCanvasInspectEvent.type,
        //     async (e: KiCanvasInspectEvent) => {
        //         this.#selected = e.detail.item as SchematicSymbol;
        //         await this.update();
        //         this.renderRoot.querySelector("dialog")?.showModal();
        //     },
        // );
    }

    override render() {
        if (!this.#selected) {
            return html``;
        }

        const properties = [];

        for (const prop of this.#selected.properties.values()) {
            properties.push(html`<div class="property">
                <label for="${prop.name}">${prop.name}</label>
                <input
                    type="text"
                    readonly
                    id="${prop.name}"
                    name="${prop.name}"
                    value="${prop.text}" />
            </div>`);
        }

        return html`<dialog>
            <form method="dialog">
                <div class="properties">${properties}</div>
                <button>Close</button>
            </form>
        </dialog>`;
    }
}

window.customElements.define("kicanvas-dialog", KiCanvasDialogElement);
