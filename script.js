// ===== Booking template (copied to clipboard from the Book Now popup) =====
// One per language. The Korean text below is a DRAFT — replace with the
// wording you give me.
const BOOKING_TEMPLATE = {
    en: `Name & date of birth:
City / Country:
Desired design: (please attach an image in your message)
Color, size, placement:
Budget:
(Optional) Design edits:
(Optional) Custom design idea:`,
    ko: `이름 및 생년월일:
원하시는 도안: (메세지에 이미지를 첨부해주세요)
색상, 크기, 부위:
(선택) 도안 수정 사항:
(선택) 주문 제작 아이디어:`
};

// KakaoTalk open-chat / channel link. Leave empty until provided.
const KAKAO_URL = 'https://open.kakao.com/me/murarctic';
const INSTAGRAM_URL = 'https://instagram.com/murarctic';
const EMAIL = 'murarctic123@gmail.com';

// Opening announcement (shown once per browser session). Bilingual in one box.
const ANNOUNCEMENT_HTML = `
    <h2 class="modal-title announce-title">예약 가능 일정<span class="announce-sub">available slots</span></h2>
    <div class="announce-slots">
        <p class="slot-month">6월 · june</p>
        <p>서울 seoul</p>
        <p class="slot-month">7월 · july</p>
        <p>부산 busan</p>
        <p>제주 jeju</p>
        <p>서울 seoul</p>
    </div>
    <div class="announce-langs">
        <button type="button" class="announce-lang" onclick="chooseLanguageHome('en')">English</button>
        <button type="button" class="announce-lang" onclick="chooseLanguageHome('ko')">한국어</button>
    </div>`;

// Optional site watermark (hand-drawn logo). Set to a path to enable,
// or '' to disable. Currently disabled.
const WATERMARK_SRC = '';

// ===== Language switching (English + Korean) =====
let currentLanguage = localStorage.getItem('preferredLanguage') || 'ko';
if (!['en', 'ko'].includes(currentLanguage)) currentLanguage = 'ko';

function applyLanguage(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    document.querySelectorAll('[data-en], [data-ko]').forEach(el => {
        // .menu-bar carries labels for the marquee builder; its children are
        // managed by buildMarquees(), so never overwrite its textContent here.
        if (el.classList.contains('menu-bar')) return;
        const val = el.getAttribute('data-' + lang);
        if (val !== null) el.textContent = val;
    });

    // English-only items (e.g. the Waitlist bar) are hidden in other languages.
    document.querySelectorAll('.en-only').forEach(el => {
        el.style.display = (lang === 'en') ? '' : 'none';
    });

    // Language class drives the contact-button order (Kakao first in Korean).
    document.body.classList.toggle('lang-ko', lang === 'ko');
    document.body.classList.toggle('lang-en', lang !== 'ko');

    // Swap the copyable booking template to the current language.
    const ta = document.getElementById('booking-template');
    if (ta) { ta.value = BOOKING_TEMPLATE[lang] || BOOKING_TEMPLATE.en; autosizeTemplate(); }
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    applyLanguage(lang);
    buildMarquees(); // labels may have changed length -> rebuild
}

// Header language buttons: clicking the current language stays on the page;
// clicking the other language jumps to the MAIN page in that language.
function setLanguageHome(lang) {
    if (lang === currentLanguage) return;
    localStorage.setItem('preferredLanguage', lang);
    window.location.href = 'index.html';
}

// Opening popup: always go to the main page in the chosen language.
function chooseLanguageHome(lang) {
    sessionStorage.setItem('announceSeen', '1'); // don't reshow the popup
    localStorage.setItem('preferredLanguage', lang);
    window.location.href = 'index.html';
}

// ===== Shared header (injected into #site-header on every page) =====
function renderHeader() {
    const mount = document.getElementById('site-header');
    if (!mount) return;

    mount.className = 'site-header';
    mount.innerHTML = `
        <div class="header-left">
            <button type="button" class="header-action" onclick="openBooking()" data-en="book or enquire" data-ko="예약 혹은 문의">book or enquire</button>
        </div>
        <div class="header-center">
            <a href="index.html" class="site-name">mura</a>
        </div>
        <nav class="lang-selector">
            <button class="lang-btn" onclick="setLanguageHome('en')" data-lang="en">EN</button>
            <button class="lang-btn" onclick="setLanguageHome('ko')" data-lang="ko">KO</button>
        </nav>`;
}

// ===== Booking modal =====
function renderBookingModal() {
    if (document.getElementById('booking-modal')) return;

    // Kakao only shows on the Korean site (CSS hides .contact-btn.kakao in EN).
    const kakaoBtn = KAKAO_URL
        ? `<a class="contact-btn kakao" href="${KAKAO_URL}" target="_blank" rel="noopener">kakao</a>`
        : '';

    const overlay = document.createElement('div');
    overlay.id = 'booking-modal';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-label="Booking">
            <button class="modal-close" onclick="closeBooking()" aria-label="Close">&times;</button>
            <h2 class="modal-title" data-en="book or enquire" data-ko="예약 혹은 문의">book or enquire</h2>
            <p class="modal-intro" data-en="To book, copy and fill in the template below — or feel free to ignore it and just ask me a question. Either way, reach me by DM." data-ko="예약을 원하시면 아래 양식을 복사해 작성해 주세요. 양식은 건너뛰고 편하게 질문만 보내주셔도 괜찮습니다. DM 또는 카카오톡으로 연락 주세요.">To book, copy and fill in the template below — or feel free to ignore it and just ask me a question. Either way, reach me by DM.</p>
            <div class="booking-template-wrap">
                <textarea id="booking-template" class="booking-template" rows="5" readonly></textarea>
                <div class="copy-row">
                    <button class="copy-btn" onclick="copyTemplate()" data-en="copy" data-ko="복사하기">copy</button>
                </div>
            </div>
            <div class="contact-options">
                <a class="contact-btn ig" href="${INSTAGRAM_URL}" target="_blank" rel="noopener">dm</a>
                ${kakaoBtn}
                <a class="contact-btn email" href="mailto:${EMAIL}">email</a>
            </div>
            <p class="modal-foot"><a href="waitlist.html" data-en="Not in your area yet? Join the waitlist →" data-ko="아직 근처에 안 계신가요? 대기열에 등록하기 →">Not in your area yet? Join the waitlist →</a></p>
        </div>`;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeBooking(); });
    document.body.appendChild(overlay);
    document.getElementById('booking-template').value = BOOKING_TEMPLATE[currentLanguage] || BOOKING_TEMPLATE.en;
}

function openBooking() {
    const m = document.getElementById('booking-modal');
    if (m) {
        m.classList.add('open');
        document.body.classList.add('modal-open');
        requestAnimationFrame(autosizeTemplate);
    }
}

// Shrink the template box to fit its text (no empty space). Only when visible.
function autosizeTemplate() {
    const ta = document.getElementById('booking-template');
    if (!ta || !ta.offsetParent) return;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
}

function closeBooking() {
    const m = document.getElementById('booking-modal');
    if (m) { m.classList.remove('open'); document.body.classList.remove('modal-open'); }
}

async function copyTemplate() {
    const ta = document.getElementById('booking-template');
    const btn = document.querySelector('.copy-btn');
    try {
        await navigator.clipboard.writeText(ta.value);
    } catch (e) {
        ta.select();
        document.execCommand('copy');
    }
    if (btn) {
        const prev = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = prev; btn.classList.remove('copied'); }, 1500);
    }
}

// ===== Opening announcement =====
function renderAnnouncement() {
    if (document.getElementById('announce-modal')) return;
    const overlay = document.createElement('div');
    overlay.id = 'announce-modal';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal modal--announce" role="dialog" aria-modal="true" aria-label="Announcement">
            <button class="modal-close" onclick="closeAnnounce()" aria-label="Close">&times;</button>
            ${ANNOUNCEMENT_HTML}
        </div>`;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeAnnounce(); });
    document.body.appendChild(overlay);
}

function openAnnounce() {
    const m = document.getElementById('announce-modal');
    if (m) { m.classList.add('open'); document.body.classList.add('modal-open'); }
}

function closeAnnounce() {
    const m = document.getElementById('announce-modal');
    if (m) { m.classList.remove('open'); document.body.classList.remove('modal-open'); }
    sessionStorage.setItem('announceSeen', '1');
}

// ===== Shared footer (copyright + email + rights) =====
function renderFooter() {
    if (document.querySelector('.footer')) return;
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
        <p class="footer-line">
            <span data-en="mura © 2026" data-ko="무라 © 2026">mura © 2026</span>
            <span class="footer-sep">·</span>
            <a href="mailto:${EMAIL}">${EMAIL}</a>
        </p>
        <p class="footer-rights" data-en="All works © mura. Please do not reproduce, repost, or use for AI / ML training without permission." data-ko="모든 작품의 저작권은 mura에 있습니다. 허가 없이 복제, 재게시, AI 학습에 사용하지 마세요.">All works © mura. Please do not reproduce, repost, or use for AI / ML training without permission.</p>`;
    document.body.appendChild(footer);
}

// ===== Site watermark (single faint logo above the footer) =====
function renderWatermark() {
    if (!WATERMARK_SRC || document.querySelector('.site-watermark')) return;
    const wrap = document.createElement('div');
    wrap.className = 'site-watermark';
    const img = document.createElement('img');
    img.src = WATERMARK_SRC;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    wrap.appendChild(img);
    document.body.appendChild(wrap);
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeBooking(); closeAnnounce(); } });

// ===== Light copy / save deterrents (note: screenshots still work) =====
function showCopyToast() {
    let t = document.getElementById('copy-toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'copy-toast';
        t.className = 'copy-toast';
        document.body.appendChild(t);
    }
    t.textContent = (currentLanguage === 'ko')
        ? '© mura — 복사 및 저장을 삼가주세요.'
        : "© mura — please don't copy or save.";
    t.classList.add('show');
    clearTimeout(showCopyToast._t);
    showCopyToast._t = setTimeout(() => t.classList.remove('show'), 1800);
}

function isEditableField(el) {
    return !!(el && el.closest && el.closest('input, textarea, .booking-template'));
}

document.addEventListener('contextmenu', (e) => {
    if (isEditableField(e.target)) return;     // allow right-click in form fields
    e.preventDefault();
    showCopyToast();
});

document.addEventListener('dragstart', (e) => {
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
});

document.addEventListener('copy', (e) => {
    if (isEditableField(e.target)) return;     // allow copying the booking template
    e.preventDefault();
    showCopyToast();
});

// ===== Seamless looping menu marquee =====
// Each .menu-bar carries data-en/ko/jp labels. We render two identical
// segments side by side and slide the track by exactly one segment width,
// so the loop never visibly "refreshes".
const MARQUEE_SPEED = 90; // px per second
// Per-bar horizontal start offset (px) so the bars don't all line up.
const MARQUEE_OFFSETS = [-15, -180, -90, -260, -45, -200, -120, -310];

// Celadon maebyeong silhouette: width fraction (0..1) from top (0) to base (1).
function vaseProfile(p) {
    const pts = [[0, 0.16], [0.10, 0.58], [0.22, 1.0], [0.40, 0.86], [0.60, 0.64], [0.80, 0.50], [1, 0.46]];
    for (let k = 0; k < pts.length - 1; k++) {
        const a = pts[k], b = pts[k + 1];
        if (p <= b[0]) { const f = (p - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * f; }
    }
    return pts[pts.length - 1][1];
}

function buildMarquees() {
    // Bars currently shown (Waitlist is hidden in Korean).
    const visible = [];
    document.querySelectorAll('.menu-bar').forEach(bar => {
        const mt = bar.querySelector('.menu-text');
        if (!mt) return;
        if (bar.offsetParent === null) { mt.innerHTML = ''; bar.style.clipPath = ''; bar.style.webkitClipPath = ''; return; }
        visible.push(bar);
    });
    const N = visible.length || 1;

    visible.forEach((bar, index) => {
        const label = bar.getAttribute('data-' + currentLanguage) || bar.getAttribute('data-en') || '';
        const menuText = bar.querySelector('.menu-text');
        const W = Math.round(menuText.clientWidth);
        const H = Math.round(menuText.clientHeight);
        if (!W || !H) return;
        bar.style.backgroundColor = ''; // use the CSS bar colour

        // Smooth GPU marquee: two identical segments sliding by exactly one segment.
        const makeSeg = () => {
            const seg = document.createElement('span');
            seg.className = 'marquee-seg';
            for (let i = 0; i < 8; i++) {
                const w = document.createElement('span');
                w.className = 'marquee-word';
                w.textContent = label;
                seg.appendChild(w);
            }
            return seg;
        };
        const track = document.createElement('div');
        track.className = 'marquee';
        track.style.marginLeft = (MARQUEE_OFFSETS[index % MARQUEE_OFFSETS.length] || 0) + 'px';
        const seg1 = makeSeg();
        const seg2 = makeSeg();
        seg2.setAttribute('aria-hidden', 'true');
        track.appendChild(seg1);
        track.appendChild(seg2);
        menuText.innerHTML = '';
        menuText.appendChild(track);
        const segWidth = seg1.getBoundingClientRect().width;
        if (segWidth > 0) track.style.animationDuration = (segWidth / MARQUEE_SPEED) + 's';

        // Vase silhouette: each bar is a frustum slice whose left/right edges
        // follow the maebyeong profile at the top, middle and bottom of the bar,
        // so the stacked bars trace one continuous vase outline.
        const pT = index / N, pM = (index + 0.5) / N, pB = (index + 1) / N;
        const wT = Math.max(120, vaseProfile(pT) * W);
        const wM = Math.max(120, vaseProfile(pM) * W);
        const wB = Math.max(120, vaseProfile(pB) * W);
        const tlx = (W - wT) / 2, trx = W - tlx;
        const mlx = (W - wM) / 2, mrx = W - mlx;
        const blx = (W - wB) / 2, brx = W - blx;
        const yT = Math.round(H * 0.08), yB = H - yT, midY = (yT + yB) / 2;
        const bow = Math.round(H * 0.12);
        const crx = (2 * mrx - (trx + brx) / 2).toFixed(1); // right-side control (through mid)
        const clx = (2 * mlx - (tlx + blx) / 2).toFixed(1); // left-side control
        const f = (n) => n.toFixed(1);
        const d = `path('M ${f(tlx)} ${yT} `
            + `Q ${W / 2} ${yT - bow} ${f(trx)} ${yT} `   // top edge (gentle upward bow)
            + `Q ${crx} ${midY} ${f(brx)} ${yB} `         // right edge follows the vase
            + `Q ${W / 2} ${yB - bow} ${f(blx)} ${yB} `   // bottom edge
            + `Q ${clx} ${midY} ${f(tlx)} ${yT} Z')`;     // left edge follows the vase
        bar.style.clipPath = d;
        bar.style.webkitClipPath = d;
    });
}

// ===== Gallery auto-loader =====
// Each .image-grid[data-images="folder"] loads files named 01, 02, 03 ...
// trying common extensions, stopping at the first number that has no file.
function loadGallery(grid) {
    const folder = grid.getAttribute('data-images');
    if (!folder) return;
    const exts = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'PNG'];
    const alt = grid.getAttribute('data-alt') || 'mura';
    let index = 1;
    let loaded = 0;

    const finish = () => {
        if (loaded === 0) {
            const fig = document.createElement('figure');
            fig.className = 'image-tile is-placeholder';
            fig.innerHTML = '<span class="placeholder-label">Images coming soon</span>';
            grid.appendChild(fig);
        }
    };

    const next = () => {
        const pad = String(index).padStart(2, '0');
        const tryExt = (i) => {
            if (i >= exts.length) { finish(); return; } // no file for this number -> stop
            const src = `${folder}/${pad}.${exts[i]}`;
            const probe = new Image();
            probe.onload = () => {
                const fig = document.createElement('figure');
                fig.className = 'image-tile';
                const img = document.createElement('img');
                img.src = src;
                img.alt = `${alt} ${pad}`;
                img.loading = 'lazy';
                fig.appendChild(img);
                grid.appendChild(fig);
                loaded++;
                index++;
                next();
            };
            probe.onerror = () => tryExt(i + 1);
            probe.src = src;
        };
        tryExt(0);
    };

    next();
}

// ===== Listing thumbnails =====
// Each .work-card[data-thumb="folder"] shows the work's first image (01.*).
function loadThumb(card) {
    const folder = card.getAttribute('data-thumb');
    const thumb = card.querySelector('.thumb');
    if (!folder || !thumb) return;
    const exts = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'PNG'];
    const tryExt = (i) => {
        if (i >= exts.length) return; // no image -> keep placeholder
        const src = `${folder}/01.${exts[i]}`;
        const probe = new Image();
        probe.onload = () => {
            thumb.innerHTML = '';
            const img = document.createElement('img');
            img.src = src;
            img.alt = '';
            img.loading = 'lazy';
            thumb.appendChild(img);
        };
        probe.onerror = () => tryExt(i + 1);
        probe.src = src;
    };
    tryExt(0);
}

// ===== Init =====
function init() {
    renderWatermark();
    renderHeader();
    renderBookingModal();
    renderAnnouncement();
    renderFooter();
    applyLanguage(currentLanguage);
    buildMarquees();
    document.querySelectorAll('.image-grid[data-images]').forEach(loadGallery);
    document.querySelectorAll('.work-card[data-thumb]').forEach(loadThumb);

    // Show the opening announcement once per session.
    if (!sessionStorage.getItem('announceSeen')) openAnnounce();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Fonts can load after first paint and change text width; rebuild once ready.
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(buildMarquees);
}
window.addEventListener('resize', buildMarquees);
