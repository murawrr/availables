# Portfolio images

Each work page loads its images automatically from its own folder.
Just drop image files into the right folder — no code editing needed.

## Where each page looks

| Page         | Folder                          |
|--------------|---------------------------------|
| episode 1    | images/episodes/episode-1/      |
| episode 2    | images/episodes/episode-2/      |
| mura-type 01 | images/mura-types/mura-type-01/ |
| mura-type 02 | images/mura-types/mura-type-02/ |
| mura-type 03 | images/mura-types/mura-type-03/ |
| mura-type 04 | images/mura-types/mura-type-04/ |

The page shows a square (1:1) grid. Tapping a square opens a viewer where you
can swipe left/right between images and tap to zoom.

There are two ways to organize a folder.

## Option A — Grouped (recommended): one square per design, with versions

Put each design in its own numbered subfolder. The subfolder becomes ONE square
in the grid (its cover is `01`). Inside, `01`, `02`, `03` ... are the versions
you swipe through in the viewer.

```
images/mura-types/mura-type-01/
  01/                 <- design 1 = first square
    01.jpg            <- cover (shown in the grid)
    02.jpg            <- swipe to this version
    03.png
    caption.json      <- optional caption for this design
  02/                 <- design 2 = second square
    01.jpg
    02.jpg
  03/                 <- design 3 = third square
    01.jpg
```

`caption.json` (optional) holds the flash details, in either language:
```json
{ "en": "Fine-line, palm-sized. ~2 hrs.", "ko": "파인라인, 손바닥 크기. 약 2시간." }
```

## Option B — Flat: every image is its own square

Drop images straight into the folder. Each image is a square; tapping any one
opens the viewer over all of them.

```
images/mura-types/mura-type-01/01.jpg
images/mura-types/mura-type-01/02.jpg
images/mura-types/mura-type-01/03.png
```

Optional `captions.json` in the folder gives one caption per image, in order:
```json
[
  { "en": "Design one", "ko": "도안 1" },
  { "en": "Design two", "ko": "도안 2" }
]
```

## Naming rules (both options)

- Name files/subfolders in order, zero-padded: `01`, `02`, `03`, ...
- Allowed image types: `.jpg` `.jpeg` `.png` `.webp`
- Loading stops at the first missing number, so don't skip (01, 02, 03 — not 01, 03).
- The number controls the display order.

Recommended: web-optimized JPG/WebP, ~1600px on the long edge, sRGB.
