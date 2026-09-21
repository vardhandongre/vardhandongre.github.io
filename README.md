# vardhandongre.com

Static site, no build step. Served by GitHub Pages from `main` (`.nojekyll` is set, so files starting with `_` are served as-is).

## Layout

```
index.html            Home: bio, research, news, selected publications, recent notes, contact
publications.html     Full publication list with type filters (conference / journal / workshop / preprint)
notes/index.html      Blog index with tag filters
notes/<slug>.html     Individual posts
notes/_template.html  Copy this to start a new post
assets/site.css       The only stylesheet (light + dark themes)
assets/site.js        Injects the sidebar nav, mobile drawer, theme toggle, backdrop ornament
assets/theme-init.js  Sets the theme before first paint (must stay in <head>)
assets/publications.js  Publication data + renderer
assets/posts.js       Blog post index
imgs/                 Images (put paper thumbnails in imgs/pubs/, post figures in imgs/notes/)
```

## Adding a publication

Edit `assets/publications.js` and add an object to `PUBLICATIONS` (newest first within its year):

```js
{
  title: "Paper title",
  authors: ["Vardhan Dongre", "Coauthor Name"],   // "Vardhan Dongre" is bolded automatically
  venue: "NeurIPS 2026", venueShort: "NeurIPS",   // venueShort is optional; used on the placeholder tile
  year: 2026,
  type: "conference",         // conference | journal | workshop | preprint
  note: "Oral",               // optional badge
  selected: true,             // optional: show on the home page
  thumb: "imgs/pubs/paper.png",   // optional: 4:3 image
  links: { paper: "https://arxiv.org/abs/…", code: "https://github.com/…" }
}
```

Both the home page (selected only) and `publications.html` (everything, grouped by year) read from this one list.

## Writing a post

1. Copy `notes/_template.html` to `notes/<slug>.html` and write the post. Use `<h2>` for sections, `<figure>` for images, `<pre><code>` for code.
2. Add an entry to `assets/posts.js`:

```js
{ slug: "<slug>", title: "…", date: "2026-09-21", summary: "One sentence.", tags: ["Agents"], minutes: 8 }
```

The notes index, its tag filters, and the "Notes" section on the home page are all generated from that list.

## Local preview

```
python3 -m http.server 8000
```

then open http://localhost:8000.
