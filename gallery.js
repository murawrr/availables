/* ============================================================================
   DESIGNS  —  this one file controls the "도안 / available" grid and the
   "archive" grid. No other files need touching. Saves/commits go live in ~1 min.

   Each design is one square in the grid. Tapping it opens a viewer showing that
   design's own images (swipe between them, zoom in). The FIRST image is the
   cover shown in the grid.

   ----------------------------------------------------------------------------
   TO ADD A NEW IMAGE to an existing design:
     1) Upload the image into that design's folder, named with the next number
        (e.g. if it has 01–03, add 04.png).
     2) Increase that design's  count:  by 1.

   TO ADD A NEW DESIGN:
     1) Make a folder under images/ and upload 01.png, 02.png ...
     2) Copy a whole { ... } block, paste it on a new line, and change the
        folder / count / caption.

   TO MOVE A DESIGN TO THE ARCHIVE (sold out):
     - Cut its whole { ... } block from "available" and paste it into "archive".
       (You do NOT move any image files — just move the block.)

   Each block:
     { folder: "images/.../my-design", count: 3, ext: "png",
       caption: { en: "English caption", ko: "한국어 설명" } }
     - folder : where the images live (no trailing slash)
     - count  : how many images (01 ... count)
     - ext    : file type, usually "png" (or "jpg")
     - caption: shown in the viewer; can be left as "" if you don't want one
   ============================================================================ */

window.GALLERY = {

  available: [
    { folder: "images/mura-types/mura-type-01", count: 9, ext: "png", caption: { en: "pyunghwa — peace",      ko: "평화" } },
    { folder: "images/mura-types/mura-type-02", count: 1, ext: "png", caption: { en: "haebang — liberation",  ko: "해방" } },
    { folder: "images/mura-types/mura-type-03", count: 1, ext: "png", caption: { en: "taeyang — sun",         ko: "태양" } },
    { folder: "images/mura-types/mura-type-04", count: 3, ext: "png", caption: { en: "jayu — freedom",        ko: "자유" } },
    { folder: "images/episodes/episode-1",      count: 6, ext: "png", caption: { en: "Hello, world!",         ko: "Hello, world!" } },
    { folder: "images/episodes/episode-2",      count: 16, ext: "png", caption: { en: "mini-tattoos",          ko: "미니 타투" } },
  ],

  archive: [
    { folder: "images/archives", count: 1, ext: "png", caption: { en: "", ko: "" } },
  ],

};
