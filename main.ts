import { Plugin, MarkdownView } from 'obsidian';

export default class GradientSliderPlugin extends Plugin {
    async onload() {
        // Add command to insert sample slider
        this.addCommand({
            id: 'insert-sample-slider',
            name: 'Insert Sample Slider',
            editorCallback: (editor, view) => {
                const sampleSlider = `\`\`\`slider
title: Progress Tracker
value: 50
labelLeft: Start
labelRight: Complete
color: #4CAF50
\`\`\``;
                
                editor.replaceRange(sampleSlider, editor.getCursor());
            }
        });

        this.registerMarkdownCodeBlockProcessor("slider", (source, el, ctx) => {
            const rows = source.split("\n").filter(row => row.length > 0);
            const config: any = {};
            // NEU: Wir sammeln alle angegebenen Farben in einem Array
            const colors: string[] = [];

            // Parsing
            rows.forEach(row => {
                const splitIdx = row.indexOf(":");
                if (splitIdx !== -1) {
                    const key = row.substring(0, splitIdx).trim();
                    const value = row.substring(splitIdx + 1).trim();
                    
                    // Wenn der Key "color" ist, fügen wir ihn zur Liste hinzu
                    if (key === 'color') {
                        colors.push(value);
                    } else {
                        // Alle anderen Config-Werte wie bisher speichern
                        config[key] = value;
                    }
                }
            });

            const wrapper = el.createDiv({ cls: "slider-divider-wrapper" });

            if (config.title) {
                wrapper.createEl("div", { text: config.title, cls: "slider-divider-title" });
            }

            const trackContainer = wrapper.createDiv({ cls: "slider-track-container" });
            trackContainer.createEl("span", { text: config.labelLeft || "Min", cls: "slider-label" });

            const slider = trackContainer.createEl("input", {
                type: "range",
                cls: "slider-divider-input"
            });
            slider.min = "0";
            slider.max = "100";
            slider.value = config.value || "50";

            // --- NEUE FARB-LOGIK ---
            let backgroundStyle = '#e60000'; // Fallback Standardfarbe (Rot)

            if (colors.length === 1) {
                // 1. Fall: Genau eine Farbe -> Konsistente Farbe
                backgroundStyle = colors[0];
            } else if (colors.length === 2) {
                // 2. Fall: Genau zwei Farben -> Verlauf von links nach rechts
                backgroundStyle = `linear-gradient(to right, ${colors[0]}, ${colors[1]})`;
            } else if (colors.length >= 3) {
                // 3. Fall: Drei (oder mehr) Farben -> Verlauf mit Mitte
                // Wir nehmen die ersten drei angegebenen Farben
                backgroundStyle = `linear-gradient(to right, ${colors[0]}, ${colors[1]}, ${colors[2]})`;
            }
            
            // Den berechneten Style direkt auf das Element anwenden
            slider.style.background = backgroundStyle;
            // -----------------------


            trackContainer.createEl("span", { text: config.labelRight || "Max", cls: "slider-label" });

            // --- SPEICHER-FUNKTION (unverändert) ---
            slider.addEventListener("change", async () => {
                const sectionInfo = ctx.getSectionInfo(el);
                if (!sectionInfo) return;
                const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (!view) return;
                const fileContent = await this.app.vault.read(view.file);
                const lines = fileContent.split("\n");
                const startLine = sectionInfo.lineStart;
                const endLine = sectionInfo.lineEnd;
                let found = false;
                for (let i = startLine; i <= endLine; i++) {
                    if (lines[i].trim().startsWith("value:")) {
                        lines[i] = `value: ${slider.value}`;
                        found = true;
                        break;
                    }
                }
                if (found) {
                    await this.app.vault.modify(view.file, lines.join("\n"));
                }
            });
        });
    }
}