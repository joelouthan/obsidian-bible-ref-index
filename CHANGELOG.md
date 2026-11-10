# Changelog

All notable changes to Scripture Index are listed here. Versions follow [Semantic Versioning](https://semver.org/).

0.2.0 is the first published release. Versions 0.1.0 and 0.1.1 were tagged but never published; they're listed so you can see how the plugin got here.

## [0.2.1] - 2026-11-10

### Added

- **Build provenance attestations.** Each release's `main.js` and `manifest.json` now come with a signed GitHub artifact attestation. It proves the files were built from this repository by its release workflow, not uploaded by hand. To verify a download:

  ```bash
  gh attestation verify main.js -R joelouthan/obsidian-bible-ref-index
  ```

### Changed

- Release notes are now taken from this changelog.

No changes to the plugin's behavior.

## [0.2.0] - 2026-11-10

### Added

- **Scripture coverage report.** A note that shows which chapters of each book of the Bible your book cites and which it doesn't. It contains:
  - the total, e.g. "810 of 1,189 chapters (68%) are cited at least once"
  - books that are never cited
  - the 10 least-covered books, with their uncited chapters
  - a table for every book, Old and New Testament, with a coverage bar, chapters cited, the number of pages citing it, and the chapters not yet cited

  A chapter counts as cited if any reference touches it, even a single verse.
- **Coverage report** setting: the vault path for the report. It's empty by default, which turns the report off. Keep the report outside your book folder to keep it private.
- **Coverage on index page** setting (off by default): also add the coverage section to the published index page.
- **Open Scripture coverage report** command: builds the report if it doesn't exist yet, then opens it.
- The notice after a rebuild now includes chapter coverage, e.g. "810/1189 chapters cited".

### Changed

- **Link text for pages without a `# ` heading.** Pages whose title is styled HTML instead of a Markdown H1 used to appear in the index under their filename (e.g. `01-behold-our-god`). They now use their title from `SUMMARY.md` (e.g. `I. Behold Our God`). The filename is only used when neither exists.
- The plugin now creates the folder for the index page or the coverage report if it doesn't exist.

### Upgrading from 0.1.x

- If any of your pages have no `# ` heading, their link text in the index changes on the next rebuild. Expect a one-time diff in your index page.
- Coverage is off until you set a **Coverage report** path.

## [0.1.1] - 2026-11-10

Not published.

### Changed

- Renamed the plugin from **Bible Reference Index** to **Scripture Index**. The plugin id stays `bible-ref-index`, so your settings carry over.
- The comment at the top of the generated page now names the plugin "Scripture Index".

## [0.1.0] - 2026-11-10

Not published.

### Added

- Scans a book folder for Bible references and writes a **Scripture index page**: every passage cited, in canonical order, grouped by book, with links back to the pages that cite it. The page uses plain Markdown links and has no front matter, so mdBook can publish it as-is.
- **What it recognizes:**
  - full names and common abbreviations (`Romans 8:28`, `Rom. 8:28`, `Mt 5:3`)
  - numbered books in every common form (`1 John`, `1John`, `I John`, `1st John`, `First John`)
  - verse ranges, including ranges across chapters (`Genesis 1:1–2:3`)
  - lists (`John 3:16-18, 22`, `Romans 8:28; 9:1, 5`)
  - whole chapters (`Psalm 23`)
  - single-chapter books (`Jude 3`)
  - `.` as the chapter–verse separator (`Matthew 5.3`)

  It skips code, HTML, URLs and link targets, and it discards references that don't exist, such as `Genesis 51:1`.
- Links to pages listed in `SUMMARY.md` only, because mdBook builds only those pages. Within each passage, pages are listed in `SUMMARY.md` order.
- Old and New Testament jump links at the top of the page.
- **Settings:** Include whole chapters, When to update, Idle minutes, Book folder, Index page, Page title, Header image, Only pages listed in SUMMARY.md, Exclude.
- **Update schedule:** by default the page is rebuilt at most once a day, after the book folder has been idle for 5 minutes. Other options: *Whenever idle* and *Manual only*.
- **Rebuild Scripture index now** command.
- The page is rewritten only when its content changes, so synced or git-tracked vaults don't see empty changes.
- Works on desktop and mobile.

[0.2.1]: https://github.com/joelouthan/obsidian-bible-ref-index/releases/tag/0.2.1
[0.2.0]: https://github.com/joelouthan/obsidian-bible-ref-index/releases/tag/0.2.0
[0.1.1]: https://github.com/joelouthan/obsidian-bible-ref-index/commit/a088468
[0.1.0]: https://github.com/joelouthan/obsidian-bible-ref-index/commit/e947f87
