/**
 * BlueMap Marker Manager - Extrude Marker Editor Extension
 *
 * This script provides a graphical editing tool for Extrude Markers
 * in BlueMap, generating coordinates and output in the BMM plugin format.
 *
 * Controls:
 * - Ctrl + X: Toggle editor panel and editing mode
 * - Shift + Left Click on Map: Add a new polygon point (vertex)
 * - Left Click + Drag point handle: Move an existing point
 * - Right Click point handle: Delete the point
 */

(function () {
    const CSS_STYLE = `
    .bmm-editor-panel {
        position: fixed;
        top: 70px;
        right: 20px;
        width: 350px;
        max-height: 85vh;
        background: rgba(18, 18, 18, 0.85);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 14px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
        color: #ffffff;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 13px;
        z-index: 1000000;
        display: flex;
        flex-direction: column;
        pointer-events: auto;
        user-select: none;
        box-sizing: border-box;
    }

    .bmm-editor-header {
        padding: 14px 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: grab;
    }

    .bmm-editor-header:active {
        cursor: grabbing;
    }

    .bmm-editor-title {
        font-weight: 600;
        font-size: 14px;
        letter-spacing: 0.3px;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .bmm-editor-close {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.4);
        font-size: 18px;
        cursor: pointer;
        line-height: 1;
        padding: 2px 6px;
        transition: color 0.15s ease;
    }

    .bmm-editor-close:hover {
        color: #ff3b30;
    }

    .bmm-editor-body {
        padding: 18px;
        overflow-y: auto;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    .bmm-field-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .bmm-field-group label {
        font-weight: 500;
        color: rgba(255, 255, 255, 0.65);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .bmm-input {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 6px;
        color: #fff;
        padding: 8px 10px;
        font-size: 13px;
        font-family: inherit;
        transition: all 0.15s ease;
        box-sizing: border-box;
        width: 100%;
    }

    .bmm-input:focus {
        outline: none;
        border-color: #007aff;
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.25);
    }

    .bmm-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }

    .bmm-color-row {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .bmm-color-picker-wrapper {
        position: relative;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.15);
        flex-shrink: 0;
    }

    .bmm-color-picker {
        position: absolute;
        top: -5px;
        left: -5px;
        width: 48px;
        height: 48px;
        border: none;
        background: transparent;
        cursor: pointer;
    }

    .bmm-color-slider {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .bmm-points-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.65);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 5px;
    }

    .bmm-points-list {
        max-height: 120px;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.15);
        padding: 6px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .bmm-point-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 8px;
        background: rgba(255, 255, 255, 0.04);
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
    }

    .bmm-point-delete {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        font-size: 12px;
        padding: 0 4px;
        line-height: 1;
    }

    .bmm-point-delete:hover {
        color: #ff3b30;
    }

    .bmm-btn {
        border: none;
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
    }

    .bmm-btn-primary {
        background: #007aff;
        color: #fff;
    }

    .bmm-btn-primary:hover {
        background: #0062cc;
        transform: translateY(-1px);
    }

    .bmm-btn-secondary {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .bmm-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.13);
    }

    .bmm-btn-destructive {
        background: rgba(255, 59, 48, 0.15);
        color: #ff453a;
        border: 1px solid rgba(255, 59, 48, 0.25);
    }

    .bmm-btn-destructive:hover {
        background: rgba(255, 59, 48, 0.25);
    }

    .bmm-json-area {
        margin-top: 10px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 10px;
        max-height: 180px;
        overflow: auto;
        font-family: monospace;
        font-size: 11px;
        white-space: pre-wrap;
        user-select: text;
    }

    .bmm-footer {
        padding: 12px 18px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        gap: 8px;
    }

    .bmm-instructions {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.45);
        line-height: 1.4;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        padding-top: 8px;
        margin-top: 5px;
    }

    .bmm-handle-dot {
        width: 10px;
        height: 10px;
        border: 1.5px solid #ffffff;
        border-radius: 50%;
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 0 5px rgba(0,0,0,0.6);
        transition: transform 0.12s ease, background-color 0.12s ease;
    }
    .bmm-handle-dot:hover {
        transform: scale(1.5) !important;
    }
    `;

    class ExtrudeMarkerEditor {
        constructor() {
            this.active = false;
            this.points = []; // Array of {x, y, z}
            this.markerSet = null;
            this.previewMarker = null;
            this.handles = []; // Array of HtmlMarker
            this.activeDragIndex = -1;
            this.originalControls = null;

            // Model state
            this.label = "Unnamed";
            this.detail = "";
            this.position = { x: 0.0, y: 64.0, z: 0.0 };
            this.maxHeight = 120.0;
            this.markerSetId = "Claimed";
            this.owner = "c7aa24e3-2080-425b-93b4-a3a74952c3d9";
            this.fillColor = { r: 97, g: 221, b: 255, a: 0.2 };

            this.uiContainer = null;
            this.canvasListener = null;

            // Handle display & LOD settings
            this.showHandles = true;
            this.maxHandleDistance = 2200; // Fade out handles when camera is > 2200 blocks away
            this._lastHandleUpdate = 0;

            // Drag and drop variables for UI panel
            this.dragMoveHandler = null;
            this.dragUpHandler = null;
            this.cameraMoveListener = null;
        }

        init() {
            // Patch BlueMap's HtmlMarker.dispose to prevent a native bug/crash
            // where calling dispose on a removed HtmlMarker throws due to undefined element
            if (window.BlueMap && window.BlueMap.HtmlMarker) {
                window.BlueMap.HtmlMarker.prototype.dispose = function () {
                    try {
                        let el = this.element;
                        if (el && el.parentNode) {
                            el.parentNode.removeChild(el);
                        }
                    } catch (e) {
                        // ignore double dispose/removal errors
                    }
                };
            }

            // Patch BlueMap's MarkerSet.updateMarkerSetsFromData to prevent it
            // from deleting our bmm-editor-set during automatic map updates
            if (window.BlueMap && window.BlueMap.MarkerSet) {
                const originalUpdateMarkerSets = window.BlueMap.MarkerSet.prototype.updateMarkerSetsFromData;
                window.BlueMap.MarkerSet.prototype.updateMarkerSetsFromData = function (data = {}, ignore = []) {
                    if (Array.isArray(ignore) && !ignore.includes("bmm-editor-set")) {
                        ignore.push("bmm-editor-set");
                    }
                    return originalUpdateMarkerSets.call(this, data, ignore);
                };
            }

            // Append CSS
            const style = document.createElement("style");
            style.textContent = CSS_STYLE;
            document.head.appendChild(style);

            // Setup shortcut listeners
            window.addEventListener("keydown", (e) => {
                if (e.ctrlKey && e.key.toLowerCase() === "x") {
                    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
                        return; // Let copy/paste/cut shortcut behave normally in inputs
                    }
                    e.preventDefault();
                    this.toggle();
                }
            });

            console.log("BMM Extrude Marker Editor loaded. Press Ctrl + X to toggle.");
        }

        toggle() {
            this.active = !this.active;
            if (this.active) {
                this.showUI();
                this.enableEditing();
            } else {
                this.hideUI();
                this.disableEditing();
            }
        }

        showUI() {
            if (this.uiContainer) return;

            this.uiContainer = document.createElement("div");
            this.uiContainer.className = "bmm-editor-panel";
            this.uiContainer.id = "bmm-editor-panel";
            this.uiContainer.innerHTML = `
                <div class="bmm-editor-header" id="bmm-editor-header">
                    <div class="bmm-editor-title">
                        <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24">
                            <path d="M17,11H15V9H17M13,11H11V9H13M9,11H7V9H9M19,5H5C3.89,5 3,5.89 3,7V17A2,2 0 0,0 5,19H19A2,2 0 0,0 21,17V7C21,5.89 20.1,5 19,5Z" />
                        </svg>
                        BMM Extrude Marker Editor
                    </div>
                    <button class="bmm-editor-close" id="bmm-editor-close">&times;</button>
                </div>
                <div class="bmm-editor-body">
                    <div class="bmm-field-group">
                        <label for="bmm-input-label">Jméno vlastníka v MC</label>
                        <input type="text" class="bmm-input" id="bmm-input-label" value="${this.label}">
                    </div>
                    <div class="bmm-field-group">
                        <label for="bmm-input-detail">Název</label>
                        <input type="text" class="bmm-input" id="bmm-input-detail" value="${this.detail}">
                    </div>
                    <div class="bmm-row">
                        <div class="bmm-field-group">
                            <label for="bmm-input-position">Základní Pozice (X, Y, Z)</label>
                            <input type="text" class="bmm-input" id="bmm-input-position" value="${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)}, ${this.position.z.toFixed(1)}">
                        </div>
                        <div class="bmm-field-group">
                            <label for="bmm-input-max-height">Max Výška (Y)</label>
                            <input type="number" class="bmm-input" id="bmm-input-max-height" value="${this.maxHeight}" step="0.5">
                        </div>
                    </div>
                    <div class="bmm-row" style="display: none;">
                        <div class="bmm-field-group">
                            <label for="bmm-input-marker-set">Marker Set</label>
                            <input type="text" class="bmm-input" id="bmm-input-marker-set" value="${this.markerSetId}">
                        </div>

                        <div class="bmm-field-group">
                            <label for="bmm-input-owner">Owner UUID</label>
                            <input type="text" class="bmm-input" id="bmm-input-owner" value="${this.owner}">
                        </div>
                        
                    </div>
                    <div class="bmm-field-group">
                        <label>Barva výplně a průhlednost</label>
                        <div class="bmm-color-row">
                            <div class="bmm-color-picker-wrapper">
                                <input type="color" class="bmm-color-picker" id="bmm-color-picker" value="${this.rgbToHex(this.fillColor.r, this.fillColor.g, this.fillColor.b)}">
                            </div>
                            <div class="bmm-color-slider">
                                <input type="text" class="bmm-input" id="bmm-color-hex" value="${this.rgbToHex(this.fillColor.r, this.fillColor.g, this.fillColor.b)}" placeholder="#rrggbb" maxlength="7" style="font-family: monospace; font-size: 12px; padding: 5px 8px;">
                                <div style="display:flex; align-items:center; gap: 6px; margin-top: 4px;">
                                    <span style="font-size:10px; color:rgba(255,255,255,0.5); flex-shrink:0;">Průhlednost:</span>
                                    <input type="range" class="bmm-input" id="bmm-color-opacity" min="0" max="1" step="0.05" value="${this.fillColor.a}" style="padding: 0; height: 14px; flex-grow: 1;">
                                    <span id="bmm-opacity-text" style="font-size:10px; color:rgba(255,255,255,0.5); flex-shrink:0; min-width: 32px; text-align:right;">${Math.round(this.fillColor.a * 100)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <div class="bmm-points-header">
                            <span>Body polygonu (XZ)</span>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <label style="font-size: 10px; text-transform: none; color: rgba(255,255,255,0.6); cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                    <input type="checkbox" id="bmm-toggle-handles" ${this.showHandles ? "checked" : ""} style="cursor: pointer;"> Zobrazit body
                                </label>
                                <span id="bmm-points-count">0 bodů</span>
                            </div>
                        </div>
                        <div class="bmm-points-list" id="bmm-points-list">
                            <div style="color: rgba(255,255,255,0.3); text-align: center; padding: 10px;">Shift + klik na mapu pro přidání bodů</div>
                        </div>
                    </div>

                    <div class="bmm-field-group">
                        <label for="bmm-json-text">BMM JSON raw data</label>
                        <textarea class="bmm-input bmm-json-area" id="bmm-json-text" placeholder="Zde se vygeneruje JSON..."></textarea>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px;">
                            <button class="bmm-btn bmm-btn-secondary" id="bmm-btn-copy" style="font-size: 11px; padding: 6px;">Kopírovat</button>
                            <button class="bmm-btn bmm-btn-secondary" id="bmm-btn-import-text" style="font-size: 11px; padding: 6px;">Importovat text</button>
                        </div>
                    </div>
                    
                    <div class="bmm-instructions">
                        <strong>Nápověda:</strong><br>
                        • <b>Ctrl + X</b>: Zobrazit / Skrýt toto menu<br>
                        • <b>Shift + Levý klik</b>: Vytvořit nový bod na mapě<br>
                        • <b>Alt + Levý klik</b>: Nastavit základní pozici (XYZ)<br>
                        • <b>Ctrl + Levý klik na bod</b>: Smazat bod
                    </div>
                </div>
                <div class="bmm-footer">
                    <button class="bmm-btn bmm-btn-destructive" id="bmm-btn-clear" style="flex-grow: 1;">Vymazat</button>
                    <button class="bmm-btn bmm-btn-secondary" id="bmm-btn-import-file">Nahrát</button>
                    <input type="file" id="bmm-file-input" style="display: none;" accept=".json">
                    <button class="bmm-btn bmm-btn-primary" id="bmm-btn-download">Stáhnout</button>
                </div>
            `;

            document.body.appendChild(this.uiContainer);

            // Prevent key events from bubbling to BlueMap camera controller
            const stopPropagation = (e) => {
                e.stopPropagation();
            };
            this.uiContainer.querySelectorAll("input, textarea").forEach(input => {
                input.addEventListener("keydown", stopPropagation);
                input.addEventListener("keyup", stopPropagation);
                input.addEventListener("keypress", stopPropagation);
            });

            // Drag panel listeners
            this.makePanelDraggable(document.getElementById("bmm-editor-header"), this.uiContainer);

            // Bind listeners
            document.getElementById("bmm-input-label").addEventListener("input", (e) => {
                this.label = e.target.value;
                this.updatePreview();
            });
            document.getElementById("bmm-input-detail").addEventListener("input", (e) => {
                this.detail = e.target.value;
                this.updatePreview();
            });
            document.getElementById("bmm-input-position").addEventListener("input", (e) => {
                let parts = e.target.value.split(",");
                if (parts.length >= 3) {
                    this.position.x = parseFloat(parts[0]) || 0;
                    this.position.y = parseFloat(parts[1]) || 64;
                    this.position.z = parseFloat(parts[2]) || 0;
                    this.updatePreview();
                }
            });
            document.getElementById("bmm-input-max-height").addEventListener("input", (e) => {
                this.maxHeight = parseFloat(e.target.value) || 0;
                this.updatePreview();
            });
            document.getElementById("bmm-input-marker-set").addEventListener("input", (e) => {
                this.markerSetId = e.target.value;
                this.updatePreview();
            });
            document.getElementById("bmm-input-owner").addEventListener("input", (e) => {
                this.owner = e.target.value;
                this.updatePreview();
            });

            document.getElementById("bmm-toggle-handles")?.addEventListener("change", (e) => {
                this.showHandles = e.target.checked;
                this.updatePreview();
            });

            document.getElementById("bmm-points-list")?.addEventListener("scroll", () => {
                this.renderVirtualPointsList();
            });

            document.getElementById("bmm-color-picker").addEventListener("input", (e) => {
                let hex = e.target.value;
                let rgb = this.hexToRgb(hex);
                if (rgb) {
                    this.fillColor.r = rgb.r;
                    this.fillColor.g = rgb.g;
                    this.fillColor.b = rgb.b;
                }
                document.getElementById("bmm-color-hex").value = hex;
                this.updatePreview();
            });

            document.getElementById("bmm-color-hex").addEventListener("input", (e) => {
                let val = e.target.value.trim();
                if (!val.startsWith("#")) val = "#" + val;
                let rgb = this.hexToRgb(val);
                if (rgb) {
                    this.fillColor.r = rgb.r;
                    this.fillColor.g = rgb.g;
                    this.fillColor.b = rgb.b;
                    document.getElementById("bmm-color-picker").value = val;
                    this.updatePreview();
                }
            });

            document.getElementById("bmm-color-opacity").addEventListener("input", (e) => {
                let opacity = parseFloat(e.target.value);
                this.fillColor.a = opacity;
                document.getElementById("bmm-opacity-text").innerText = Math.round(opacity * 100) + "%";
                this.updatePreview();
            });

            document.getElementById("bmm-btn-clear").addEventListener("click", () => {
                this.label = "Unnamed";
                this.detail = "";
                this.position = { x: 0.0, y: 64.0, z: 0.0 };
                this.maxHeight = 120.0;
                this.markerSetId = "Claimed";
                this.owner = "c7aa24e3-2080-425b-93b4-a3a74952c3d9";
                this.fillColor = { r: 97, g: 221, b: 255, a: 0.2 };
                this.points = [];
                this.updatePreview();
                this.updateUIFields();
            });

            document.getElementById("bmm-btn-copy").addEventListener("click", () => {
                let json = this.generateBmmJson();
                navigator.clipboard.writeText(json).then(() => {
                    alert("JSON zkopírován do schránky!");
                }).catch(err => {
                    console.error(err);
                    alert("Nepodařilo se kopírovat do schránky.");
                });
            });

            document.getElementById("bmm-btn-import-text").addEventListener("click", () => {
                let text = document.getElementById("bmm-json-text").value;
                if (text) {
                    this.importBmmJson(text);
                } else {
                    alert("Nejprve vložte JSON do textového pole.");
                }
            });

            document.getElementById("bmm-btn-import-file").addEventListener("click", () => {
                document.getElementById("bmm-file-input").click();
            });
            document.getElementById("bmm-file-input").addEventListener("change", (e) => {
                let file = e.target.files[0];
                if (file) {
                    let reader = new FileReader();
                    reader.onload = (evt) => {
                        this.importBmmJson(evt.target.result);
                    };
                    reader.readAsText(file);
                }
            });

            document.getElementById("bmm-btn-download").addEventListener("click", () => {
                let json = this.generateBmmJson();
                let lowercaseLabel = this.label.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
                if (!lowercaseLabel) lowercaseLabel = "marker";

                let blob = new Blob([json], { type: "application/json" });
                let url = URL.createObjectURL(blob);
                let link = document.createElement("a");
                link.href = url;
                link.download = `${lowercaseLabel}.json`;
                link.click();
                URL.revokeObjectURL(url);
            });

            document.getElementById("bmm-editor-close").addEventListener("click", () => {
                this.toggle();
            });
        }

        hideUI() {
            if (this.uiContainer) {
                this.uiContainer.parentNode.removeChild(this.uiContainer);
                this.uiContainer = null;
            }
        }

        makePanelDraggable(headerEl, containerEl) {
            let startX, startY, initialMouseX, initialMouseY;

            headerEl.addEventListener("pointerdown", (e) => {
                if (e.target.closest("button")) return;
                e.preventDefault();
                initialMouseX = e.clientX;
                initialMouseY = e.clientY;

                let rect = containerEl.getBoundingClientRect();
                startX = rect.left;
                startY = rect.top;

                const onPointerMove = (moveEvt) => {
                    let dx = moveEvt.clientX - initialMouseX;
                    let dy = moveEvt.clientY - initialMouseY;
                    containerEl.style.left = (startX + dx) + "px";
                    containerEl.style.top = (startY + dy) + "px";
                    containerEl.style.right = "auto";
                };

                const onPointerUp = () => {
                    window.removeEventListener("pointermove", onPointerMove);
                    window.removeEventListener("pointerup", onPointerUp);
                };

                window.addEventListener("pointermove", onPointerMove);
                window.addEventListener("pointerup", onPointerUp);
            });
        }

        enableEditing() {
            let mapViewer = window.bluemap.mapViewer;
            if (!mapViewer) return;

            // 1. Ensure MarkerSet
            if (!this.markerSet) {
                this.markerSet = new window.BlueMap.MarkerSet("bmm-editor-set");
                mapViewer.markers.add(this.markerSet);
            }

            // 2. Ensure PreviewMarker
            if (!this.previewMarker) {
                this.previewMarker = new window.BlueMap.ExtrudeMarker("bmm-preview-marker");
                this.markerSet.add(this.previewMarker);
            }

            // 3. Setup terrain click listener (Shift + Left Click for points, Alt + Left Click for pivot position)
            this.canvasListener = (e) => {
                if (e.shiftKey && e.button === 0) {
                    e.stopPropagation();
                    e.preventDefault();
                    let hit = this.getTerrainIntersection(e.clientX, e.clientY);
                    if (hit) {
                        this.addPoint(hit.x, hit.y, hit.z);
                    }
                } else if (e.altKey && e.button === 0) {
                    e.stopPropagation();
                    e.preventDefault();
                    let hit = this.getTerrainIntersection(e.clientX, e.clientY);
                    if (hit) {
                        this.position = {
                            x: parseFloat(hit.x.toFixed(1)),
                            y: parseFloat(hit.y.toFixed(1)),
                            z: parseFloat(hit.z.toFixed(1))
                        };
                        this.updateUIFields();
                        this.updatePreview();
                    }
                }
            };
            mapViewer.rootElement.addEventListener("pointerdown", this.canvasListener, true);

            // 4. Setup camera move listener for dynamic frustum culling of off-screen handles
            this.cameraMoveListener = () => {
                if (this.active && this.showHandles && this.points.length > 0) {
                    this.throttledUpdateHandles();
                }
            };
            if (mapViewer?.events) {
                mapViewer.events.addEventListener("bluemapCameraMoved", this.cameraMoveListener);
            }

            this.updatePreview();
        }

        disableEditing() {
            let mapViewer = window.bluemap.mapViewer;
            if (mapViewer && this.canvasListener) {
                mapViewer.rootElement.removeEventListener("pointerdown", this.canvasListener, true);
                this.canvasListener = null;
            }

            if (mapViewer?.events && this.cameraMoveListener) {
                mapViewer.events.removeEventListener("bluemapCameraMoved", this.cameraMoveListener);
                this.cameraMoveListener = null;
            }

            if (this.markerSet) {
                this.clearHandles();
                if (this.previewMarker) {
                    this.markerSet.remove(this.previewMarker);
                    this.previewMarker = null;
                }
                mapViewer.markers.remove(this.markerSet);
                this.markerSet = null;
            }
        }

        addPoint(x, y, z) {
            x = parseFloat(x.toFixed(1));
            y = parseFloat(y.toFixed(1));
            z = parseFloat(z.toFixed(1));

            if (this.points.length === 0) {
                this.position = { x, y, z };
                if (this.maxHeight === 84.0 || !this.maxHeight) {
                    this.maxHeight = parseFloat((y + 20).toFixed(1));
                }
                this.updateUIFields();
            }

            this.points.push({ x, y, z });
            this.updatePreview();
        }

        deletePoint(index) {
            this.points.splice(index, 1);
            if (index === 0 && this.points.length > 0) {
                this.position = { x: this.points[0].x, y: this.points[0].y, z: this.points[0].z };
                this.updateUIFields();
            }
            this.updatePreview();
        }

        clearHandles() {
            if (this.markerSet) {
                this.handles.forEach(h => {
                    if (h) this.markerSet.remove(h);
                });
            }
            this.handles = [];
        }

        throttledUpdateHandles() {
            let now = Date.now();
            if (now - this._lastHandleUpdate > 100) {
                this._lastHandleUpdate = now;
                this.updateHandles();
            }
        }

        updateHandles() {
            if (!this.markerSet) return;

            // Trim excess handles if points count decreased
            while (this.handles.length > this.points.length) {
                let handle = this.handles.pop();
                if (handle) {
                    this.markerSet.remove(handle);
                }
            }

            const mapViewer = window.bluemap?.mapViewer;
            const camera = mapViewer?.camera;

            if (camera) {
                camera.updateMatrixWorld(true);
            }

            const screenVec = window.BlueMap?.Three ? new window.BlueMap.Three.Vector3() : null;
            const baseMaxDist = this.showHandles ? this.maxHandleDistance : 0;

            // Reuse or create handles in-place (Pooled)
            this.points.forEach((p, idx) => {
                let handle = this.handles[idx];
                let color = (idx === 0) ? "#34c759" : "#ff5b52";
                let isNew = false;

                if (!handle) {
                    handle = new window.BlueMap.HtmlMarker("bmm-handle-" + idx);
                    this.markerSet.add(handle);
                    this.handles[idx] = handle;
                    isNew = true;
                }

                // 2D Viewport Screen Projection Check (NDC):
                // Projects world position (x, y, z) into Normalized Device Coordinates [-1, +1]
                let isVisibleOnScreen = true;
                if (camera && screenVec && this.showHandles) {
                    screenVec.set(p.x, p.y + 0.15, p.z);
                    screenVec.project(camera);

                    let inScreenX = (screenVec.x >= -1.25 && screenVec.x <= 1.25);
                    let inScreenY = (screenVec.y >= -1.25 && screenVec.y <= 1.25);
                    // In 2D Orthographic mode, Z elevation depth shouldn't cut off bottom-half points
                    let inScreenZ = camera.isOrthographicCamera ? true : (screenVec.z < 1.0);

                    isVisibleOnScreen = inScreenX && inScreenY && inScreenZ;
                } else if (!this.showHandles) {
                    isVisibleOnScreen = false;
                }

                // Explicitly toggle Three.js Object3D visibility so CSS2DRenderer skips traversal
                handle.visible = isVisibleOnScreen;
                if (handle.elementObject) {
                    handle.elementObject.visible = isVisibleOnScreen;
                }

                handle.updateFromData({
                    position: { x: p.x, y: p.y + 0.15, z: p.z },
                    html: `<div class="bmm-handle-dot" data-index="${idx}"></div>`,
                    anchor: { x: 5, y: 5 },
                    maxDistance: isVisibleOnScreen ? baseMaxDist : 0,
                    classes: []
                });

                // Directly hide HTML DOM element so CSS2DRenderer & browser layout engine skip transform calculations
                if (handle.element) {
                    handle.element.style.display = isVisibleOnScreen ? "" : "none";
                }

                let dotEl = handle.element?.querySelector?.(".bmm-handle-dot");
                if (dotEl) {
                    dotEl.dataset.index = idx;
                    dotEl.style.backgroundColor = color;

                    if (isNew || !dotEl._hasListeners) {
                        dotEl._hasListeners = true;
                        dotEl.addEventListener("pointerenter", () => {
                            let i = parseInt(dotEl.dataset.index);
                            let hColor = (i === 0) ? "#15ff4f" : "#ff0d00";
                            dotEl.style.backgroundColor = hColor;
                        });
                        dotEl.addEventListener("pointerleave", () => {
                            let i = parseInt(dotEl.dataset.index);
                            let cColor = (i === 0) ? "#34c759" : "#ff5b52";
                            dotEl.style.backgroundColor = cColor;
                        });

                        dotEl.addEventListener("pointerdown", (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            let i = parseInt(dotEl.dataset.index);
                            if (e.ctrlKey && e.button === 0) {
                                this.deletePoint(i);
                            } else if (e.button === 0) {
                                this.startDragging(i);
                            }
                        });

                        dotEl.addEventListener("contextmenu", (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        });
                    }
                }
            });
        }

        updatePreview() {
            if (!this.previewMarker || !this.markerSet) return;

            let fillCol = { r: this.fillColor.r, g: this.fillColor.g, b: this.fillColor.b, a: this.fillColor.a };
            let lineCol = { r: this.fillColor.r, g: this.fillColor.g, b: this.fillColor.b, a: 0.4 };
            let minY = 0;
            let maxY = this.maxHeight;

            let markerData = {
                position: { x: this.position.x, y: this.position.y, z: this.position.z },
                label: this.label,
                detail: this.detail,
                shape: this.points.map(p => ({ x: p.x, z: p.z })),
                shapeMinY: minY,
                shapeMaxY: maxY,
                depthTest: true,
                lineWidth: 2,
                lineColor: lineCol,
                fillColor: fillCol
            };

            if (this.points.length >= 3) {
                this.previewMarker.visible = true;
                this.previewMarker.updateFromData(markerData);
            } else {
                this.previewMarker.visible = false;
            }

            // High performance pooled handles update
            this.updateHandles();

            this.updateUIPointsList();
            this.updateUILiveJson();
        }

        // Optimized update: only updates geometry and single handle coordinate during drag
        updatePreviewMarkerOnly() {
            if (!this.previewMarker) return;

            let fillCol = { r: this.fillColor.r, g: this.fillColor.g, b: this.fillColor.b, a: this.fillColor.a };
            let lineCol = { r: this.fillColor.r, g: this.fillColor.g, b: this.fillColor.b, a: 1.0 };
            let minY = this.position.y;
            let maxY = this.maxHeight;

            let markerData = {
                position: { x: this.position.x, y: this.position.y, z: this.position.z },
                label: this.label,
                detail: this.detail,
                shape: this.points.map(p => ({ x: p.x, z: p.z })),
                shapeMinY: minY,
                shapeMaxY: maxY,
                depthTest: true,
                lineWidth: 2,
                lineColor: lineCol,
                fillColor: fillCol
            };

            if (this.points.length >= 3) {
                this.previewMarker.visible = true;
                this.previewMarker.updateFromData(markerData);
            } else {
                this.previewMarker.visible = false;
            }

            this.updateUILiveJson();
        }

        startDragging(index) {
            this.activeDragIndex = index;
            this.originalControls = window.bluemap.mapViewer.controlsManager.controls;

            // Pause camera movement controls
            window.bluemap.mapViewer.controlsManager.controls = null;

            this.dragMoveHandler = (e) => {
                if (this.activeDragIndex === -1) return;
                let hit = this.getTerrainIntersection(e.clientX, e.clientY);
                if (hit) {
                    this.points[this.activeDragIndex].x = parseFloat(hit.x.toFixed(1));
                    this.points[this.activeDragIndex].y = parseFloat(hit.y.toFixed(1));
                    this.points[this.activeDragIndex].z = parseFloat(hit.z.toFixed(1));

                    // Keep handle position updated in 3D
                    let activeHandle = this.handles[this.activeDragIndex];
                    if (activeHandle) {
                        activeHandle.position.set(hit.x, hit.y + 0.15, hit.z);
                    }

                    // Pivot synchronization
                    if (this.activeDragIndex === 0) {
                        this.position = { x: this.points[0].x, y: this.points[0].y, z: this.points[0].z };
                        this.updateUIFields();
                    }

                    this.updatePreviewMarkerOnly();
                }
            };

            this.dragUpHandler = () => {
                window.removeEventListener("pointermove", this.dragMoveHandler);
                window.removeEventListener("pointerup", this.dragUpHandler);

                // Restore camera controls
                if (this.originalControls) {
                    window.bluemap.mapViewer.controlsManager.controls = this.originalControls;
                    this.originalControls = null;
                }
                this.activeDragIndex = -1;

                // Full update to redraw points lists and update elements cleanly
                this.updatePreview();
            };

            window.addEventListener("pointermove", this.dragMoveHandler);
            window.addEventListener("pointerup", this.dragUpHandler);
        }

        getTerrainIntersection(screenX, screenY) {
            let mapViewer = window.bluemap.mapViewer;
            if (!mapViewer || !mapViewer.map || !mapViewer.map.isLoaded) return null;

            let rect = mapViewer.rootElement.getBoundingClientRect();
            let x = ((screenX - rect.left) / mapViewer.rootElement.clientWidth) * 2 - 1;
            let y = -((screenY - rect.top) / mapViewer.rootElement.clientHeight) * 2 + 1;

            let raycaster = new window.BlueMap.Three.Raycaster();
            raycaster.setFromCamera(new window.BlueMap.Three.Vector2(x, y), mapViewer.camera);

            let intersectScenes = [mapViewer.map.hiresTileManager.scene];
            for (let i = 0; i < mapViewer.map.lowresTileManager.length; i++) {
                if (mapViewer.map.lowresTileManager[i] && mapViewer.map.lowresTileManager[i].scene) {
                    intersectScenes.push(mapViewer.map.lowresTileManager[i].scene);
                }
            }

            let intersects = raycaster.intersectObjects(intersectScenes, true);
            for (let hit of intersects) {
                if (hit.object && hit.point) {
                    let parent = hit.object;
                    let visible = parent.visible;
                    while (visible && parent.parent) {
                        parent = parent.parent;
                        visible = parent.visible;
                    }
                    if (visible) {
                        return hit.point;
                    }
                }
            }
            return null;
        }

        generateBmmJson() {
            let mapName = window.bluemap?.mapViewer?.map?.data?.id || "world";
            if (!this.label) this.label = "Unnamed";
            let lowercaseLabel = this.label.toLowerCase().replace(/[^a-z0-9_-]/g, "_");

            let posX = parseFloat(this.position.x).toFixed(1);
            let posY = parseFloat(this.position.y).toFixed(1);
            let posZ = parseFloat(this.position.z).toFixed(1);
            let positionStr = `${posX},${posY},${posZ}`;

            let colorStr = `${this.fillColor.r},${this.fillColor.g},${this.fillColor.b},${this.fillColor.a.toFixed(2)}`;
            let maxH = parseFloat(this.maxHeight).toFixed(1);

            let edges = this.points.map(p => {
                let px = parseFloat(p.x).toFixed(1);
                let pz = parseFloat(p.z).toFixed(1);
                return `"${px},${pz}"`;
            });

            let edgesStr = edges.length > 0 ? "\n" + edges.map(e => "          " + e).join(",\n") + "\n        " : "";

            let detailPart = (this.detail && this.detail.trim() !== "") ? `
      "DETAIL": {
        "type": "de.miraculixx.bmm.map.data.Box.BoxString",
        "value": "${this.detail}"
      },` : "";

            let json = `{
  "${lowercaseLabel}": {
    "owner": "${this.owner}",
    "type": "EXTRUDE",
    "attributes": {
      "MAP": {
        "type": "de.miraculixx.bmm.map.data.Box.BoxString",
        "value": "${mapName}"
      },
      "MARKER_SET": {
        "type": "de.miraculixx.bmm.map.data.Box.BoxString",
        "value": "${this.markerSetId}"
      },
      "HEIGHT": {
        "type": "de.miraculixx.bmm.map.data.Box.BoxFloat",
        "value": 0.0
      },
      "LINE_WIDTH": {
        "type": "de.miraculixx.bmm.map.data.Box.BoxInt",
        "value": 0
      },
      "FILL_COLOR": {
        "type": "de.miraculixx.bmm.map.data.Box.BoxColor",
        "value": "${colorStr}"
      },
      "POSITION": {
        "type": "de.miraculixx.bmm.map.data.Box.BoxVector3d",
        "value": "${positionStr}"
      },
      "MAX_HEIGHT": {
        "type": "de.miraculixx.bmm.map.data.Box.BoxFloat",
        "value": ${maxH}
      },
      "ID": {
        "type": "de.miraculixx.bmm.map.data.Box.BoxString",
        "value": "${lowercaseLabel}"
      },
      "LABEL": {
        "type": "de.miraculixx.bmm.map.data.Box.BoxString",
        "value": "${this.label}"
      },
${detailPart}
      "ADD_EDGE": {
        "type": "de.miraculixx.bmm.map.data.Box.BoxVector2dList",
        "value": [${edgesStr}]
      }
    }
  }
}`;
            return json;
        }

        importBmmJson(jsonStr) {
            try {
                let clean = jsonStr.trim();
                if (!clean.startsWith("{")) {
                    clean = "{" + clean + "}";
                }

                let parsed = JSON.parse(clean);
                let key = Object.keys(parsed)[0];
                if (!key) throw new Error("Invalid structure");

                let marker = parsed[key];
                if (!marker || marker.type !== "EXTRUDE") {
                    throw new Error("Only EXTRUDE markers are supported");
                }

                let attr = marker.attributes;
                if (!attr) throw new Error("Attributes not found");

                this.label = attr.LABEL?.value || key;
                this.detail = attr.DETAIL?.value || "";
                this.markerSetId = attr.MARKER_SET?.value || "Claimed";
                this.owner = marker.owner || "c7aa24e3-2080-425b-93b4-a3a74952c3d9";

                if (attr.FILL_COLOR?.value) {
                    console.log("Importing fill color:", attr.FILL_COLOR.value);
                    let parts = attr.FILL_COLOR.value.split(",");
                    console.log("Parsed parts:", parts);
                    if (parts.length >= 3) {
                        this.fillColor.r = parseInt(parts[0]) || 0;
                        this.fillColor.g = parseInt(parts[1]) || 0;
                        this.fillColor.b = parseInt(parts[2]) || 0;
                        this.fillColor.a = parseFloat(parts[3]) || 0.2;
                    }
                    console.log("Imported fill color:", this.fillColor);
                }

                if (attr.POSITION?.value) {
                    let parts = attr.POSITION.value.split(",");
                    if (parts.length >= 3) {
                        this.position.x = parseFloat(parts[0]) || 0;
                        this.position.y = parseFloat(parts[1]) || 64;
                        this.position.z = parseFloat(parts[2]) || 0;
                    }
                }

                if (attr.MAX_HEIGHT?.value !== undefined) {
                    this.maxHeight = parseFloat(attr.MAX_HEIGHT.value) || 84;
                }

                this.points = [];
                if (attr.ADD_EDGE?.value && Array.isArray(attr.ADD_EDGE.value)) {
                    attr.ADD_EDGE.value.forEach(edge => {
                        let parts = edge.split(",");
                        if (parts.length === 2) {
                            let ex = parseFloat(parts[0]);
                            let ez = parseFloat(parts[1]);
                            this.points.push({ x: ex, y: this.position.y, z: ez });
                        }
                    });
                }

                this.updateUIFields();
                this.updatePreview();
                alert("Import úspěšný!");
            } catch (e) {
                console.error(e);
                alert("Nebylo možné načíst JSON. Ujistěte se, že formát je správný: " + e.message);
            }
        }

        updateUIFields() {
            if (!this.uiContainer) return;
            document.getElementById("bmm-input-label").value = this.label;
            document.getElementById("bmm-input-detail").value = this.detail;

            let posX = parseFloat(this.position.x).toFixed(1);
            let posY = parseFloat(this.position.y).toFixed(1);
            let posZ = parseFloat(this.position.z).toFixed(1);
            document.getElementById("bmm-input-position").value = `${posX}, ${posY}, ${posZ}`;

            document.getElementById("bmm-input-max-height").value = this.maxHeight;
            document.getElementById("bmm-input-marker-set").value = this.markerSetId;
            document.getElementById("bmm-input-owner").value = this.owner;

            let hex = this.rgbToHex(this.fillColor.r, this.fillColor.g, this.fillColor.b);
            document.getElementById("bmm-color-picker").value = hex;
            document.getElementById("bmm-color-hex").value = hex;

            document.getElementById("bmm-color-opacity").value = this.fillColor.a;
            document.getElementById("bmm-opacity-text").innerText = Math.round(this.fillColor.a * 100) + "%";
        }

        updateUIPointsList() {
            let countEl = document.getElementById("bmm-points-count");
            if (countEl) {
                countEl.innerText = `${this.points.length} bodů`;
            }
            this.renderVirtualPointsList();
        }

        renderVirtualPointsList() {
            let container = document.getElementById("bmm-points-list");
            if (!container) return;

            if (this.points.length === 0) {
                container.innerHTML = `<div style="color: rgba(255,255,255,0.3); text-align: center; padding: 10px;">Shift + klik na mapu pro přidání bodů</div>`;
                return;
            }

            // Virtual Scrolling (Windowing): total height represents all items, but only visible items are rendered
            const ITEM_HEIGHT = 28;
            const totalHeight = this.points.length * ITEM_HEIGHT;
            const containerHeight = container.clientHeight || 120;
            const scrollTop = container.scrollTop;

            let startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - 2);
            let endIndex = Math.min(this.points.length, Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + 2);

            let offsetY = startIndex * ITEM_HEIGHT;

            let itemsHtml = "";
            for (let i = startIndex; i < endIndex; i++) {
                let p = this.points[i];
                let labelStr = i === 0 ? "Start" : `#${i + 1}`;
                itemsHtml += `<div class="bmm-point-item" style="height: ${ITEM_HEIGHT}px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between;">
                    <span><b>${labelStr}:</b> X: ${p.x.toFixed(1)}, Z: ${p.z.toFixed(1)} (Y: ${p.y.toFixed(1)})</span>
                    <button class="bmm-point-delete" data-index="${i}">&times;</button>
                </div>`;
            }

            container.innerHTML = `
                <div style="height: ${totalHeight}px; position: relative; width: 100%;">
                    <div style="position: absolute; top: 0; left: 0; right: 0; transform: translateY(${offsetY}px); display: flex; flex-direction: column; gap: 2px;">
                        ${itemsHtml}
                    </div>
                </div>
            `;

            container.querySelectorAll(".bmm-point-delete").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    let idx = parseInt(btn.dataset.index);
                    if (!isNaN(idx)) this.deletePoint(idx);
                });
            });
        }

        updateUILiveJson() {
            let textarea = document.getElementById("bmm-json-text");
            if (textarea) {
                textarea.value = this.generateBmmJson();
            }
        }

        rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }

        hexToRgb(hex) {
            let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
    }

    // Poller to initialize when BlueMap finishes loading
    function pollInit() {
        if (
            window.bluemap &&
            window.bluemap.mapViewer &&
            window.bluemap.mapViewer.markers &&
            window.BlueMap &&
            window.BlueMap.Three
        ) {
            const editor = new ExtrudeMarkerEditor();
            editor.init();
            window.bmmExtrudeEditor = editor; // Expose globally for manual manipulation or external hooks
        } else {
            setTimeout(pollInit, 200);
        }
    }

    pollInit();
})();
