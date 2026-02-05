var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => GradientSliderPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var GradientSliderPlugin = class extends import_obsidian.Plugin {
  async onload() {
    this.addCommand({
      id: "insert-sample-slider",
      name: "Insert Sample Slider",
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
      const rows = source.split("\n").filter((row) => row.length > 0);
      const config = {};
      const colors = [];
      rows.forEach((row) => {
        const splitIdx = row.indexOf(":");
        if (splitIdx !== -1) {
          const key = row.substring(0, splitIdx).trim();
          const value = row.substring(splitIdx + 1).trim();
          if (key === "color") {
            colors.push(value);
          } else {
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
      let backgroundStyle = "#e60000";
      if (colors.length === 1) {
        backgroundStyle = colors[0];
      } else if (colors.length === 2) {
        backgroundStyle = `linear-gradient(to right, ${colors[0]}, ${colors[1]})`;
      } else if (colors.length >= 3) {
        backgroundStyle = `linear-gradient(to right, ${colors[0]}, ${colors[1]}, ${colors[2]})`;
      }
      slider.style.background = backgroundStyle;
      trackContainer.createEl("span", { text: config.labelRight || "Max", cls: "slider-label" });
      slider.addEventListener("change", async () => {
        const sectionInfo = ctx.getSectionInfo(el);
        if (!sectionInfo) return;
        const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
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
};
