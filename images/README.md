# Portfolio images

The **design grids** (the `available` and `archive` pages) are controlled by one
file in the project root: **`gallery.js`**. That file lists each design — its
folder, how many images it has, and its caption — and whether it's in the
`available` or `archive` group.

## To add / change images

1. Upload your image files into a folder under `images/`, named in order and
   zero-padded: `01.png`, `02.png`, `03.png` …
2. Open **`gallery.js`** and either bump a design's `count`, or paste a new
   `{ folder, count, ext, caption }` block. (Full instructions are inside that
   file.)

To **archive** a design (sold out), move its block from `available` to
`archive` in `gallery.js` — no image files need to move.

## Notes

- Allowed types: `.png` `.jpg` `.jpeg` `.webp` (set `ext` to match).
- Grid thumbnails are auto-resized for fast loading; the viewer shows the
  full-resolution original. Recommended originals: ~1600px on the long edge.
- The opening-popup cover image is separate — see `images/popup/`.
