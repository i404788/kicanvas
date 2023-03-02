/*
    Copyright (c) 2023 Alethea Katherine Flowers.
    Published under the standard MIT License.
    Full text available at: https://opensource.org/licenses/MIT
*/

import { DropTarget } from "../dom/drag-drop";
import * as theme from "../kicad/theme";
import { KiCanvasSchematicElement } from "./kicanvas-schematic";
import { CustomElement, html } from "../dom/custom-elements";
import kicanvas_app_styles from "./kicanvas-app.css";
import kc_ui_styles from "./kc-ui.css";
import { GitHubUserContent } from "../services/github";
import { KCBoardViewerElement } from "./kc-board-viewer";

class KiCanvasAppElement extends CustomElement {
    static override styles = kc_ui_styles + kicanvas_app_styles;

    constructor() {
        super();
    }

    override initialContentCallback() {
        const src = this.getAttribute("src");
        if (src) {
            this.load(src);
        }

        const url_params = new URLSearchParams(document.location.search);
        const github_path = url_params.get("github");

        if (github_path) {
            const gh = new GitHubUserContent();
            const gh_url = gh.convert_url(github_path);
            (async () => {
                this.load(await gh.get(gh_url));
            })();
        } else {
            new DropTarget(this, ["kicad_sch", "kicad_pcb"], (files) => {
                this.load(files[0]!);
            });
        }
    }

    async load(src: File | string) {
        if (typeof src == "string") {
            src = new File([await (await window.fetch(src)).blob()], src);
        }

        this.setBooleanAttribute("loading", true);

        this.renderRoot.querySelector("main")?.remove();

        const extension = src.name.split(".").at(-1);

        let view_elem: KiCanvasSchematicElement | KCBoardViewerElement;
        let content;

        switch (extension) {
            case "kicad_sch":
                view_elem =
                    html`<kicanvas-schematic></kicanvas-schematic>` as KiCanvasSchematicElement;
                content = html`<main>${view_elem}</main>`;
                break;

            case "kicad_pcb":
                {
                    view_elem =
                        html`<kc-board-viewer></kc-board-viewer>` as KCBoardViewerElement;

                    content = html`
                        <kc-ui-app>
                            ${view_elem}
                        </ki-ui-app>`;

                    // const layer_controls_elem =
                    //     html`<kicanvas-layer-controls></kicanvas-layer-controls>` as KiCanvasLayerControlsElement;
                    // layer_controls_elem.target = view_elem;

                    // const info_bar_elem =
                    //     html`<kicanvas-info-bar></kicanvas-info-bar>` as KiCanvasInfoBarElement;
                    // info_bar_elem.target = view_elem;

                    // content = html`<main>
                    //     <div class="split-horizontal">
                    //         <div class="split-vertical">
                    //             ${view_elem} ${layer_controls_elem}
                    //         </div>
                    //         ${info_bar_elem}
                    //     </div>
                    // </main>`;
                }
                break;
            default:
                throw new Error(`Unable to display file ${src.name}`);
        }

        this.renderRoot.appendChild(content);

        await view_elem.load(src);

        this.setBooleanAttribute("loaded", true);
        this.setBooleanAttribute("loading", false);
    }

    override render() {
        this.style.backgroundColor = theme.schematic.background.to_css();
        this.style.color = theme.schematic.note.to_css();

        return html`
            <section class="overlay">
                <img src="kicanvas.png" />
                <p>Drag & drop your kicad schematic or board file here.</p>
            </section>
            <kicanvas-dialog></kicanvas-dialog>
        `;
    }
}

window.customElements.define("kicanvas-app", KiCanvasAppElement);
