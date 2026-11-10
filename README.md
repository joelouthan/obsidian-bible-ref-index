# Bible Reference Index

Builds a **Scripture index page** for a book you write in Obsidian and publish with [mdBook](https://rust-lang.github.io/mdBook/). The plugin finds every Bible reference in your book folder and writes one page that lists each passage in canonical order, with links back to the pages that cite it.

```markdown
## Genesis

- **Genesis 1** — [Our Forever Home](genesis/genesis01-6-13.md) · [The Fall of Mankind](confession/06-1-fall.md)
- **Genesis 1:1** — [The Creator of Heaven and Earth](creed/creator.md)
- **Genesis 22:1–14** — [The Gospel Sacrifice](genesis/genesis22.md)
```

The page uses plain Markdown links, not wikilinks, so mdBook (or any static site generator) can publish it as-is. It has no front matter.

See it live: [theologic.us Scripture Index](https://theologic.us/scripture-index.html).

## What it recognizes

- Full names and common abbreviations: `Romans 8:28`, `Rom. 8:28`, `Mt 5:3`, `Jn. 3:16`, `Ps 23:1`
- Numbered books: `1 John`, `1John`, `I John`, `1st John`, `First John`
- Ranges, including ranges that cross chapters: `Genesis 22:1-14`, `Genesis 1:1–2:3`
- Lists: `John 3:16-18, 22` and `Romans 8:28; 9:1, 5`
- Whole chapters: `Psalm 23`, `Genesis 1–11`. These count only with the full book name, and you can turn them off.
- Single-chapter books: `Jude 3` is indexed as Jude 1:3.
- `.` as the chapter–verse separator (`Matthew 5.3`) and verse parts (`Romans 3:23a`)

It skips code, HTML tags and comments, URLs, and link targets. It also discards references that don't exist, such as `Genesis 51:1`.

## Settings

| Setting | Default | Notes |
| --- | --- | --- |
| Include whole chapters | on | Off keeps only references with a verse. |
| When to update | Once a day, when idle | Rebuilds at most once every 24 hours, after the book folder has been quiet for the idle time. Other options: *Whenever idle* and *Manual only*. |
| Idle minutes | 5 | How long to wait after the last edit before writing. |
| Book folder | `src` | Scanned recursively. `SUMMARY.md` is read from here. |
| Index page | `src/scripture-index.md` | The generated page. Anything you edit in it is overwritten. |
| Page title | Scripture Index | |
| Header image | *(empty)* | Optional `src` for an `<img class="intro-right">` line above the title. |
| Only pages listed in SUMMARY.md | on | mdBook builds only the pages listed in `SUMMARY.md`, so links to any other page would be broken. |
| Exclude | `CHANGELOG.md` | Comma-separated paths inside the book folder. |

The command **Rebuild Scripture index now** rebuilds the page immediately.

The plugin rewrites the index page only when its content changes. If your vault is synced or auto-committed to git, an unchanged index doesn't create a new commit.

## Getting started

1. Install **Bible Reference Index** from Community plugins and enable it.
2. Set **Book folder** to the folder that holds your mdBook `SUMMARY.md`. Set **Index page** to a path inside it.
3. Run **Rebuild Scripture index now**.
4. Add the page to `SUMMARY.md` once, for example: `- [Scripture Index](scripture-index.md)`.

### Manual install

Download `main.js` and `manifest.json` from the [latest release](../../releases/latest). Put them in `<vault>/.obsidian/plugins/bible-ref-index/`, then enable the plugin.

## Limitations

- Only English book names are recognized, and only the 66-book Protestant canon.
- Abbreviations must include a verse. `Is 3` and `Am 5` look too much like ordinary words, so they're skipped. `Is 3:16` and `Am 5:24` are indexed.
- The index is a single page. A large book can produce a big page: about 5,000 passages from 1,100 pages comes to roughly 1 MB of Markdown.

## Development

```bash
npm install
npm test          # parser tests (Node 22.6+)
npm run build     # type-check and bundle main.js
npm run preview -- /path/to/book/src   # dry run; writes /tmp/scripture-index.md
VAULT=/path/to/vault npm run install-plugin
```

To release, bump `version` in `manifest.json` and `package.json` and add it to `versions.json`. Commit, then push a tag that matches the version exactly, with no `v` prefix (`git tag 0.2.0 && git push origin 0.2.0`). GitHub Actions builds the plugin and creates a draft release. Publish the draft.

## License

[MIT](LICENSE)
