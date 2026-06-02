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

## Naming rules

- Name files in order, zero-padded: `01`, `02`, `03`, ...
- Allowed types: `.jpg` `.jpeg` `.png` `.webp`
- Loading stops at the first missing number, so don't skip
  (use 01, 02, 03 — not 01, 03).
- The number controls the display order.

Example for mura-type 01:
```
images/mura-types/mura-type-01/01.jpg
images/mura-types/mura-type-01/02.jpg
images/mura-types/mura-type-01/03.png
```

Recommended: web-optimized JPG/WebP, ~1600px on the long edge, sRGB.
