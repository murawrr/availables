// ===== Booking template (copied to clipboard from the Book Now popup) =====
// One per language. The Korean text below is a DRAFT — replace with the
// wording you give me.
const BOOKING_TEMPLATE = {
    en: `name:
city / country
design: (preferrably a screenshot)
colour:
size:
placement:
ideas for customising the design or creating a custom design:`,
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
    <div class="announce-cols">
        <div class="announce-col">
            <h3 class="announce-h">available schedule</h3>
            <div class="announce-slots">
                <p class="slot-month">june</p>
                <p>Seoul</p>
                <p class="slot-month">july</p>
                <p>Busan</p>
                <p>Jeju</p>
                <p>Seoul</p>
            </div>
            <button type="button" class="announce-lang" onclick="chooseLanguageHome('en')">go to page</button>
        </div>
        <div class="announce-col">
            <h3 class="announce-h">예약 가능 일정</h3>
            <div class="announce-slots">
                <p class="slot-month">6월</p>
                <p>서울</p>
                <p class="slot-month">7월</p>
                <p>부산</p>
                <p>제주</p>
                <p>서울</p>
            </div>
            <button type="button" class="announce-lang" onclick="chooseLanguageHome('ko')">페이지 가기</button>
        </div>
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
            <a href="index.html" class="site-name">mura</a>
        </div>
        <div class="header-right">
            <button type="button" class="header-action" onclick="openBooking()" data-en="book or enquire" data-ko="예약 혹은 문의">book or enquire</button>
        </div>`;
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
            <p class="modal-foot en-only"><a href="waitlist.html" data-en="Not in your area yet? Join the waitlist →">Not in your area yet? Join the waitlist →</a></p>
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
        btn.textContent = (currentLanguage === 'ko') ? '복사됨!' : 'Copied!';
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
    if (m) { m.classList.add('open'); document.body.classList.add('modal-open'); document.body.classList.add('announce-open'); }
}

function closeAnnounce() {
    const m = document.getElementById('announce-modal');
    if (m) { m.classList.remove('open'); document.body.classList.remove('modal-open'); }
    document.body.classList.remove('announce-open');
    sessionStorage.setItem('announceSeen', '1');
}

// ===== Shared footer (copyright + email + rights) =====
function renderFooter() {
    if (document.querySelector('.footer')) return;
    const other = currentLanguage === 'ko' ? 'en' : 'ko';
    const switchLabel = currentLanguage === 'ko' ? 'switch to English' : 'switch to 한국어';
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
        <p class="footer-line">
            <span data-en="mura © 2026" data-ko="무라 © 2026">mura © 2026</span>
            <a href="mailto:${EMAIL}">${EMAIL}</a>
            <button class="lang-switch" onclick="setLanguageHome('${other}')">${switchLabel}</button>
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

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeBooking(); closeAnnounce(); closeLightbox(); } });

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

// Maebyeong silhouette as a SMOOTH curve. vaseProfile(p) returns the width
// fraction (0..1 of the menu width) at vertical position p (0 = top of the
// bar stack, 1 = bottom). A Catmull-Rom spline through these control points
// gives a narrow neck -> round full shoulder (widest near the top) -> concave
// body -> narrow waist. The mouth/foot caps continue the curve top & bottom.
const VASE_PTS = [
    [0.00, 0.18],  // neck base (under the lip)
    [0.10, 0.62],
    [0.20, 0.92],
    [0.27, 0.985], // shoulder — widest, rounded
    [0.40, 0.93],
    [0.55, 0.78],
    [0.70, 0.60],
    [0.84, 0.49],
    [0.95, 0.45],
    [1.00, 0.45]   // waist, just above the flared foot
];
function vaseProfile(p) {
    const P = VASE_PTS;
    if (p <= P[0][0]) return P[0][1];
    if (p >= P[P.length - 1][0]) return P[P.length - 1][1];
    let i = 0;
    while (i < P.length - 1 && p > P[i + 1][0]) i++;
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    const t = (p - p1[0]) / (p2[0] - p1[0]);
    const t2 = t * t, t3 = t2 * t;
    const y = 0.5 * ((2 * p1[1])
        + (-p0[1] + p2[1]) * t
        + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2
        + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
    return Math.max(0.06, Math.min(0.99, y));
}
function buildMarquees() {
    const visible = [];
    document.querySelectorAll('.menu-bar').forEach(bar => {
        const mt = bar.querySelector('.menu-text');
        if (!mt) return;
        if (bar.offsetParent === null) { mt.innerHTML = ''; bar.style.clipPath = ''; bar.style.webkitClipPath = ''; return; }
        visible.push(bar);
    });
    if (!visible.length) { renderVaseCaps(); return; }

    // Sample the silhouette by REAL pixel position so the half-height bars
    // (notice / archives) get the correct width slice -> smooth outline.
    const heights = visible.map(b => (b.querySelector('.menu-text').clientHeight || 1));
    const total = heights.reduce((a, b) => a + b, 0) || 1;
    const bounds = [];
    let acc = 0;
    visible.forEach((b, i) => { const t = acc / total; acc += heights[i]; bounds.push([t, acc / total]); });

    const NS = 'http://www.w3.org/2000/svg';
    const XLINK = 'http://www.w3.org/1999/xlink';
    const r = (n) => Math.round(n);

    visible.forEach((bar, index) => {
        const label = bar.getAttribute('data-' + currentLanguage) || bar.getAttribute('data-en') || '';
        const menuText = bar.querySelector('.menu-text');
        const W = Math.round(menuText.clientWidth);
        const H = Math.round(menuText.clientHeight);
        if (!W || !H) return;
        bar.style.backgroundColor = ''; // use the CSS bar colour

        const pT = bounds[index][0], pB = bounds[index][1];

        // Clip the band by SAMPLING the smooth profile down each side. Top and
        // bottom edges are flat; sides are a fine polyline of the silhouette, so
        // adjacent bands share edge points and the whole stack reads as ONE
        // continuous round-shouldered vase (no straight-line tent / zig-zag).
        const xL = (p) => (W - vaseProfile(p) * W) / 2;
        const SEG = 14;
        const parts = [`M ${r(xL(pT))} 0`, `L ${r(W - xL(pT))} 0`];
        for (let s = 1; s <= SEG; s++) { const pp = pT + (pB - pT) * s / SEG; parts.push(`L ${r(W - xL(pp))} ${r(H * s / SEG)}`); }
        parts.push(`L ${r(xL(pB))} ${H}`);
        for (let s = SEG - 1; s >= 1; s--) { const pp = pT + (pB - pT) * s / SEG; parts.push(`L ${r(xL(pp))} ${r(H * s / SEG)}`); }
        parts.push('Z');
        const d = `path('${parts.join(' ')}')`;
        bar.style.clipPath = d;
        bar.style.webkitClipPath = d;

        // ----- Static label following a gentle arc across the band -----
        const pMid = (pT + pB) / 2;
        const wM = Math.max(60, vaseProfile(pMid) * W);
        const mlx = r((W - wM) / 2), mrx = W - mlx;
        const cx = r(W / 2);
        const bow = Math.max(4, Math.round(Math.min(wM * 0.05, H * 0.4)));
        const pid = 'barpath-' + index;

        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('class', 'bar-svg');
        svg.setAttribute('width', W);
        svg.setAttribute('height', H);
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        svg.setAttribute('preserveAspectRatio', 'none');

        const defs = document.createElementNS(NS, 'defs');
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('id', pid);
        path.setAttribute('fill', 'none');
        let baseY = r(H / 2);
        path.setAttribute('d', `M ${mlx} ${baseY} Q ${cx} ${baseY + bow} ${mrx} ${baseY}`);
        defs.appendChild(path);
        svg.appendChild(defs);

        const text = document.createElementNS(NS, 'text');
        text.setAttribute('text-anchor', 'middle');
        const tp = document.createElementNS(NS, 'textPath');
        tp.setAttributeNS(XLINK, 'xlink:href', '#' + pid);
        tp.setAttribute('href', '#' + pid);
        tp.setAttribute('startOffset', '50%');
        tp.textContent = label;
        text.appendChild(tp);
        svg.appendChild(text);

        menuText.innerHTML = '';
        menuText.appendChild(svg);

        // Fit the label to the band width: measure at a base size, then scale.
        const baseFs = 100;
        text.style.fontSize = baseFs + 'px';
        let textLen = 0;
        try { textLen = text.getComputedTextLength(); } catch (e) { textLen = 0; }
        const pathLen = (path.getTotalLength && path.getTotalLength()) || wM;
        let fs = textLen > 0 ? baseFs * (pathLen * 0.8) / textLen : Math.round(H * 0.4);
        fs = Math.max(13, Math.min(fs, Math.round(H * 0.52)));
        text.style.fontSize = fs + 'px';

        baseY = r(H / 2 + fs * 0.34);
        path.setAttribute('d', `M ${mlx} ${baseY} Q ${cx} ${baseY + bow} ${mrx} ${baseY}`);
    });

    renderVaseCaps();
}

// Decorative mouth (top) and base (bottom) caps for the vase (not clickable).
function renderVaseCaps() {
    const nav = document.querySelector('.menu-bars');
    if (!nav) return;
    nav.querySelectorAll('.vase-cap').forEach(c => c.remove());
    const W = nav.clientWidth;
    if (!W) return;
    const cap = (cls, topWf, botWf, h) => {
        const el = document.createElement('div');
        el.className = 'vase-cap ' + cls;
        el.style.height = h + 'px';
        const wt = Math.round(topWf * W), wb = Math.round(botWf * W);
        const tl = Math.round((W - wt) / 2), tr = W - tl;
        const bl = Math.round((W - wb) / 2), br = W - bl;
        const r = 10;
        const d = `path('M ${tl + r} 0 L ${tr - r} 0 Q ${tr} 0 ${tr} ${r} `
            + `L ${br} ${h - r} Q ${br} ${h} ${br - r} ${h} `
            + `L ${bl + r} ${h} Q ${bl} ${h} ${bl} ${h - r} `
            + `L ${tl} ${r} Q ${tl} 0 ${tl + r} 0 Z')`;
        el.style.clipPath = d; el.style.webkitClipPath = d;
        return el;
    };
    nav.insertBefore(cap('vase-cap--mouth', 0.21, 0.17, 32), nav.firstChild); // small lip on the neck
    nav.appendChild(cap('vase-cap--base', 0.42, 0.60, 60));                   // flared lotus foot
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
                fig.addEventListener('click', () => openLightbox(src));
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

// ===== Lightbox =====
function openLightbox(src) {
    let lb = document.getElementById('lightbox');
    if (!lb) {
        lb = document.createElement('div');
        lb.id = 'lightbox';
        lb.className = 'lightbox';
        lb.innerHTML = '<img alt="">';
        lb.addEventListener('click', closeLightbox);
        document.body.appendChild(lb);
    }
    lb.querySelector('img').src = src;
    lb.classList.add('open');
    document.body.classList.add('modal-open');
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) { lb.classList.remove('open'); document.body.classList.remove('modal-open'); }
}

// ===== Back-to-top button =====
function renderBackToTop() {
    if (document.getElementById('to-top')) return;
    const btn = document.createElement('button');
    btn.id = 'to-top';
    btn.className = 'to-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Back to top');
    btn.textContent = '↑';
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(btn);
    const onScroll = () => btn.classList.toggle('show', window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

// ===== Init =====
function init() {
    renderWatermark();
    renderHeader();
    renderBookingModal();
    renderAnnouncement();
    renderFooter();
    renderBackToTop();
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
