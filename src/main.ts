import { App, Notice, Plugin, PluginSettingTab, Setting, TAbstractFile, normalizePath } from "obsidian";
import { buildIndex, summaryOrder, type Page } from "./build.ts";

type UpdateMode = "daily" | "idle" | "manual";

interface Settings {
  folder: string;
  outputPath: string;
  title: string;
  headerImage: string;
  includeChapters: boolean;
  onlySummaryPages: boolean;
  exclude: string; // comma-separated paths relative to `folder`
  updateMode: UpdateMode;
  idleMinutes: number;
  lastWritten: number; // epoch ms, internal
}

const DEFAULTS: Settings = {
  folder: "src",
  outputPath: "src/scripture-index.md",
  title: "Scripture Index",
  headerImage: "",
  includeChapters: true,
  onlySummaryPages: true,
  exclude: "CHANGELOG.md",
  updateMode: "daily",
  idleMinutes: 5,
  lastWritten: 0,
};

const DAY = 24 * 60 * 60 * 1000;

export default class BibleRefIndexPlugin extends Plugin {
  settings: Settings = { ...DEFAULTS };
  private dirty = false;
  private lastEdit = 0;
  private writing = false;

  async onload() {
    this.settings = { ...DEFAULTS, ...(await this.loadData()) };
    this.addSettingTab(new SettingsTab(this.app, this));

    this.addCommand({
      id: "rebuild-now",
      name: "Rebuild Scripture index now",
      callback: () => this.writeIndex(true),
    });

    this.app.workspace.onLayoutReady(() => {
      const touched = (f: TAbstractFile, oldPath?: string) => {
        if (this.isSource(f.path) || (oldPath !== undefined && this.isSource(oldPath))) {
          this.dirty = true;
          this.lastEdit = Date.now();
        }
      };
      this.registerEvent(this.app.vault.on("modify", (f) => touched(f)));
      this.registerEvent(this.app.vault.on("create", (f) => touched(f)));
      this.registerEvent(this.app.vault.on("delete", (f) => touched(f)));
      this.registerEvent(this.app.vault.on("rename", (f, old) => touched(f, old)));

      // Edits made while Obsidian was closed: check once at startup, after the idle wait.
      this.dirty = true;
      this.lastEdit = Date.now();
      this.registerInterval(window.setInterval(() => this.tick(), 60 * 1000));
    });
  }

  private get folder() {
    return normalizePath(this.settings.folder);
  }

  private isSource(path: string) {
    return path.startsWith(this.folder + "/") && path.endsWith(".md") && path !== normalizePath(this.settings.outputPath);
  }

  private tick() {
    const s = this.settings;
    if (s.updateMode === "manual" || !this.dirty || this.writing) return;
    const now = Date.now();
    if (now - this.lastEdit < s.idleMinutes * 60 * 1000) return;
    if (s.updateMode === "daily" && now - s.lastWritten < DAY) return;
    void this.writeIndex(false);
  }

  async writeIndex(manual: boolean) {
    if (this.writing) return;
    this.writing = true;
    try {
      const s = this.settings;
      const vault = this.app.vault;
      const out = normalizePath(s.outputPath);

      let order: string[] | null = null;
      const summary = vault.getFileByPath(`${this.folder}/SUMMARY.md`);
      if (summary) {
        order = summaryOrder(await vault.cachedRead(summary)).map((p) => `${this.folder}/${p}`);
      }
      const listed = new Set(order ?? []);
      const excluded = new Set(
        s.exclude.split(",").map((p) => p.trim()).filter(Boolean).map((p) => `${this.folder}/${p}`).concat(`${this.folder}/SUMMARY.md`, out),
      );

      const pages: Page[] = [];
      for (const f of vault.getMarkdownFiles()) {
        if (!this.isSource(f.path) || excluded.has(f.path)) continue;
        if (s.onlySummaryPages && order && !listed.has(f.path)) continue; // unlisted pages aren't built, so links would 404
        pages.push({ path: f.path, content: await vault.cachedRead(f) });
      }

      const result = buildIndex(pages, order, {
        outputPath: out,
        title: s.title,
        headerImage: s.headerImage,
        includeChapters: s.includeChapters,
      });

      // Only touch the file when the content changed, so the mirror/auto-commit don't churn.
      const existing = vault.getFileByPath(out);
      let changed = true;
      if (existing) {
        await vault.process(existing, (old) => {
          changed = old !== result.markdown;
          return result.markdown;
        });
      } else {
        await vault.create(out, result.markdown);
      }

      this.dirty = false;
      s.lastWritten = Date.now();
      await this.saveData(s);

      const rel = out.startsWith(this.folder + "/") ? out.slice(this.folder.length + 1) : out;
      const inSummary = order?.includes(out) ?? false;
      if (manual || changed) {
        new Notice(
          `Scripture index ${changed ? "updated" : "unchanged"}: ${result.passages} passages from ${result.pages} pages.` +
            (inSummary ? "" : `\nAdd "- [${s.title}](${rel})" to SUMMARY.md to publish it.`),
          inSummary ? 5000 : 12000,
        );
      }
    } catch (e) {
      console.error("Scripture Index:", e);
      new Notice(`Scripture index failed: ${e instanceof Error ? e.message : e}`);
    } finally {
      this.writing = false;
    }
  }
}

class SettingsTab extends PluginSettingTab {
  constructor(app: App, private plugin: BibleRefIndexPlugin) {
    super(app, plugin);
  }

  display() {
    const { containerEl } = this;
    const s = this.plugin.settings;
    const save = () => this.plugin.saveData(s);
    containerEl.empty();

    new Setting(containerEl)
      .setName("Include whole chapters")
      .setDesc('Index chapter-only references such as "Psalm 23" or "Genesis 1–3". Off = only references with a verse ("Psalm 23:1").')
      .addToggle((t) => t.setValue(s.includeChapters).onChange(async (v) => ((s.includeChapters = v), await save())));

    new Setting(containerEl)
      .setName("When to update")
      .setDesc("Daily is gentlest: one rebuild a day, and only once the book folder has been quiet for the idle time below. Each write flows through the mirror and auto-commit, so fewer is better.")
      .addDropdown((d) =>
        d
          .addOptions({ daily: "Once a day, when idle (recommended)", idle: "Whenever idle", manual: "Manual only (command)" })
          .setValue(s.updateMode)
          .onChange(async (v) => ((s.updateMode = v as UpdateMode), await save())),
      );

    new Setting(containerEl)
      .setName("Idle minutes")
      .setDesc("Wait this long after the last edit in the book folder before writing.")
      .addText((t) =>
        t.setValue(String(s.idleMinutes)).onChange(async (v) => {
          const m = parseInt(v, 10);
          if (m >= 1) ((s.idleMinutes = m), await save());
        }),
      );

    new Setting(containerEl)
      .setName("Book folder")
      .setDesc("Folder to scan: your mdBook src folder, or a vault folder mirrored to it. SUMMARY.md is read from here.")
      .addText((t) => t.setValue(s.folder).onChange(async (v) => ((s.folder = v.trim()), await save())));

    new Setting(containerEl)
      .setName("Index page")
      .setDesc("Vault path of the generated page. Add it to SUMMARY.md once.")
      .addText((t) => t.setValue(s.outputPath).onChange(async (v) => ((s.outputPath = v.trim()), await save())));

    new Setting(containerEl)
      .setName("Page title")
      .addText((t) => t.setValue(s.title).onChange(async (v) => ((s.title = v), await save())));

    new Setting(containerEl)
      .setName("Header image")
      .setDesc('Optional src for the <img class="intro-right"> line, relative to the index page (e.g. images/art-bible.png).')
      .addText((t) => t.setValue(s.headerImage).onChange(async (v) => ((s.headerImage = v.trim()), await save())));

    new Setting(containerEl)
      .setName("Only pages listed in SUMMARY.md")
      .setDesc("mdBook builds only listed pages; links to others would be broken.")
      .addToggle((t) => t.setValue(s.onlySummaryPages).onChange(async (v) => ((s.onlySummaryPages = v), await save())));

    new Setting(containerEl)
      .setName("Exclude")
      .setDesc("Comma-separated paths inside the book folder to skip.")
      .addText((t) => t.setValue(s.exclude).onChange(async (v) => ((s.exclude = v), await save())));

    new Setting(containerEl)
      .setName("Rebuild now")
      .setDesc(s.lastWritten ? `Last written ${new Date(s.lastWritten).toLocaleString()}.` : "Not written yet.")
      .addButton((b) => b.setButtonText("Rebuild").onClick(() => this.plugin.writeIndex(true)));
  }
}
