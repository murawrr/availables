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
     - code   : a short, unique name for the design (e.g. "PEACE-01"). This is
                what clients quote when they book — pick something distinguishable.
     - count  : how many images (01 ... count)
     - ext    : file type, usually "png" (or "jpg")
     - caption: shown on the design page; can be left as "" if you don't want one
   ============================================================================ */

window.GALLERY = {

  available: [
    {
      folder: "images/mura-types/mura-type-01", category: "muratypes", code: "PEACE-01", count: 9, ext: "png",
      caption: { en: "pyunghwa — peace", ko: "평화" },
      desc: {
        en: "The pyung-hwa flash introduces you to the ‘mura-type’ series, through which I intend to celebrate the versatile beauty of Hangul, the Korean alphabet, and spread the message of unity amongst people.",
        ko: "본 도안 ‘평화’는 한글의 변화무쌍한 매력을 기념하고 사람과 사람 간의 통합을 기원하는 ‘무라체’ 연작의 첫 걸음입니다."
      }
    },
    {
      folder: "images/mura-types/mura-type-02", category: "muratypes", code: "LIB-01", count: 1, ext: "png",
      caption: { en: "haebang — liberation", ko: "해방" },
      desc: {
        en: "In the second mura-type hae-bang, the dots and circles disintegrate from their original Hangul form in the rhythm of liberation.",
        ko: "무라체 연작의 두번째 도안은 해방입니다. 날아가는 듯한, 또 헤엄치고 있는 듯한 자유로운 점 속에 해방의 감각을 담았습니다."
      }
    },
    {
      folder: "images/mura-types/mura-type-03", category: "muratypes", code: "SUN-01", count: 1, ext: "png",
      caption: { en: "taeyang — sun", ko: "태양" },
      desc: {
        en: "In mura-type 3, cosmic chaos and balance explode through the entanglement of the Hangul form and the horse silhouette, altogether symbolising the ‘red horse’.",
        ko: "제 3번 무라체 ‘태양’에서는 한글의 형태와 태양같이 둥근 원에 담긴 말(馬)의 형태가 폭발적인 혼돈과 질서의 공간(space, 즉 우주)을 점유합니다. 붉은 말(丙午)의 정신을 담아보았습니다."
      }
    },
    {
      folder: "images/mura-types/mura-type-04", category: "muratypes", code: "FREE-01", count: 3, ext: "png",
      caption: { en: "jayu — freedom", ko: "자유" },
      desc: {
        en: "‘jayu’ itself becomes the wings of freedom.",
        ko: "날개가 된 ‘자유’ 가 무라체04입니다."
      }
    },
    { folder: "images/episodes/episode-1", category: "episodes", code: "HELLO-01", count: 6, ext: "png", caption: { en: "Hello, world!", ko: "Hello, world!" } },
    { folder: "images/episodes/episode-2", category: "episodes", code: "MINI-01", count: 16, ext: "png", caption: { en: "mini-tattoos", ko: "미니 타투" } },
  ],

  archive: [
    { folder: "images/archives", category: "episodes", code: "ARCHIVE-01", count: 1, ext: "png", caption: { en: "archive", ko: "아카이브" } },
  ],

};
