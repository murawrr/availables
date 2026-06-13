// ===== Booking template (copied to clipboard from the Book Now popup) =====
// One per language. The Korean text below is a DRAFT — replace with the
// wording you give me.
const BOOKING_TEMPLATE = {
    en: `name:
city / country:
colour:
size:
placement:`,
    ko: `이름 및 생년월일:
도시 / 국가:
색상:
크기:
부위:`
};

// Booking policy shown on the Book screen (no pricing). Edit freely; keep the
// two lists the same length so EN/KO line up.
const BOOKING_POLICY = {
    en: [
        'No minors.',
        'Bookings are confirmed in the order deposits are received; the deposit is non-refundable.',
        'Your appointment is cancelled if you are more than 30 minutes late.',
        'Re-scheduling must be requested at least 72 hours in advance.'
    ],
    ko: [
        '미성년자는 작업하지 않습니다.',
        '예약금 입금 순으로 예약이 확정되며, 예약금은 환불되지 않습니다.',
        '30분 이상 지각 시 예약이 취소됩니다.',
        '일정 변경은 작업일 3일 전까지 요청해 주세요.'
    ]
};

// KakaoTalk open-chat / channel link. Leave empty until provided.
const KAKAO_URL = 'https://open.kakao.com/me/murarctic';
const INSTAGRAM_URL = 'https://instagram.com/murarctic';
const EMAIL = 'murarctic123@gmail.com';

// Opening announcement (shown once per browser session). Bilingual in one box.
// Opening popup: just a language picker, drawn as a yin-yang. Each half is a
// button; one half is the inverted colour of the other.
const ANNOUNCEMENT_HTML = `
    <div class="lang-pick">
        <svg class="yy" viewBox="0 0 100 100" role="group" aria-label="Select language">
            <g class="yy-half yy-ko" role="button" tabindex="0" onclick="pickAnnounceLanguage('ko')">
                <path d="M50,0 A25,25 0 0,1 50,50 A25,25 0 0,0 50,100 A50,50 0 0,0 50,0 Z"/>
                <text x="28" y="50">한국어</text>
            </g>
            <g class="yy-half yy-en" role="button" tabindex="0" onclick="pickAnnounceLanguage('en')">
                <path d="M50,0 A25,25 0 0,1 50,50 A25,25 0 0,0 50,100 A50,50 0 0,1 50,0 Z"/>
                <text x="72" y="50">English</text>
            </g>
        </svg>
    </div>`;

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
    if (ta) { ta.value = bookingTemplateValue(); updateBookingContactLinks(); autosizeTemplate(); }
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    applyLanguage(lang);
    buildMarquees(); // labels may have changed length -> rebuild
}

// Header language buttons: clicking the current language stays on the page;
// clicking the other language jumps to the MAIN page in that language.
// Footer language switch: re-render the CURRENT page in the other language
// (reloading keeps the page + any ?date/?design context, unlike jumping home).
function setLanguageHome(lang) {
    if (lang === currentLanguage) return;
    localStorage.setItem('preferredLanguage', lang);
    window.location.reload();
}

// Opening popup step 1 -> apply the chosen language and reveal the calendar.
// Pick a language -> remember it and go straight to the designs page.
function pickAnnounceLanguage(lang) {
    setLanguage(lang);
    sessionStorage.setItem('announceSeen', '1');
    window.location.href = 'index.html';
}

// Go to the booking page for a chosen design (its code + cover for preview).
function bookItem(item) {
    if (!item) return;
    sessionStorage.setItem('announceSeen', '1');
    const q = new URLSearchParams();
    const code = item.code || captionText(item.caption);
    if (code) q.set('design', code);            // the form quotes this code
    if (item.src) q.set('img', new URL(item.src, location.href).href); // preview only
    window.location.href = 'booking.html?' + q.toString();
}

// "book this design" in the viewer.
function bookCurrentImage() { bookItem(lb.items[lb.index]); }

// ===== Shared header (injected into #site-header on every page) =====
function renderHeader() {
    const mount = document.getElementById('site-header');
    if (!mount) return;

    mount.className = 'site-header';
    const back = mount.dataset.back;
    mount.innerHTML = `
        <div class="header-left">
            <a href="index.html" class="site-name">mura</a>
        </div>
        <span class="header-dots" aria-hidden="true"></span>
        <div class="header-right">
            <button type="button" class="header-action" onclick="openInfoDrawer()" data-en="info" data-ko="공지">info</button>
        </div>`;

    // Back-to-home link, relocated to its own row just below the header.
    document.querySelector('.page-back')?.remove();
    if (back) {
        const b = document.createElement('a');
        b.href = back;
        b.className = 'page-back';
        b.setAttribute('data-en', '← home');
        b.setAttribute('data-ko', '← 홈');
        b.textContent = currentLanguage === 'ko' ? '← 홈' : '← home';
        mount.insertAdjacentElement('afterend', b);
    }
}

// ===== Booking (its own page: booking.html, so Back returns to the designs) =====
function bookingContentHTML() {
    // Kakao only shows on the Korean site (CSS hides .contact-btn.kakao in EN).
    const kakaoBtn = KAKAO_URL
        ? `<a class="contact-btn kakao" href="${KAKAO_URL}" target="_blank" rel="noopener" onclick="copyForChat()">kakao</a>`
        : '';
    const policyItems = BOOKING_POLICY.en
        .map((en, i) => `<li data-en="${en}" data-ko="${BOOKING_POLICY.ko[i]}">${en}</li>`)
        .join('');
    return `
        <h1 class="booking-title" data-en="enquire" data-ko="문의하기">enquire</h1>

        <label class="booking-custom">
            <input type="checkbox" id="booking-custom-chk" onchange="setBookingCustom(this.checked)">
            <span data-en="I'd like a custom design (you can reference more than one design in your message)" data-ko="주문 제작(커스텀) 도안을 원합니다 (메시지에 여러 도안을 참고로 보내실 수 있어요)">I'd like a custom design (you can reference more than one design in your message)</span>
        </label>

        <p class="modal-intro" data-en="Copy the short form below and send it to me — or use “send” to share it straight to a chat. If you came from a design, its code is already filled in." data-ko="아래 양식을 복사해 보내주세요 — 또는 ‘보내기’로 채팅에 바로 공유하세요. 도안 페이지에서 오셨다면 코드가 이미 채워져 있습니다.">Copy the short form below and send it to me — or use “send” to share it straight to a chat. If you came from a design, its code is already filled in.</p>
        <div class="booking-template-wrap">
            <textarea id="booking-template" class="booking-template" rows="5" readonly></textarea>
            <div class="copy-row">
                <button class="copy-btn" onclick="copyTemplate()" data-en="copy" data-ko="복사하기">copy</button>
            </div>
        </div>
        <div class="contact-options">
            <button type="button" class="contact-btn send" onclick="sendBooking()" data-en="send" data-ko="보내기">send</button>
            <a class="contact-btn ig" href="${INSTAGRAM_URL}" target="_blank" rel="noopener" onclick="copyForChat()">dm</a>
            ${kakaoBtn}
            <a class="contact-btn email" href="mailto:${EMAIL}">e-mail</a>
        </div>

        <div class="booking-policy">
            <h3 class="booking-policy-h" data-en="booking policy" data-ko="예약 규정">booking policy</h3>
            <p class="booking-manual" data-en="Booking requests are reviewed manually — please allow up to 48 hours for a reply." data-ko="예약 요청은 직접 검토합니다 — 답변까지 최대 48시간이 걸릴 수 있습니다.">Booking requests are reviewed manually — please allow up to 48 hours for a reply.</p>
            <ul class="booking-policy-list">${policyItems}</ul>
        </div>`;
}

// Booking template text, with "preferred date" and/or "selected design" lines
// prepended when the user arrived from a calendar date or an image
// (booking.html?date=...&time=...&place=...  or  ?design=...&img=...).
// Current booking selection on the (optional) enquiry form. { designs, custom }
let bookingState = { designs: [], custom: false };

function bookingTemplateValue() {
    const base = BOOKING_TEMPLATE[currentLanguage] || BOOKING_TEMPLATE.en;
    const s = bookingState || { designs: [] };
    const ko = currentLanguage === 'ko';
    const lines = [];

    if (s.designs && s.designs.length) {
        s.designs.forEach(g => {
            if (g.design) lines.push((ko ? '도안 코드: ' : 'design code: ') + g.design);
        });
    }
    if (s.custom) {
        lines.push(ko ? '도안 수정 또는 주문 제작 아이디어:' : 'ideas for customising the design or creating a custom design:');
    }
    return lines.length ? lines.join('\n') + '\n' + base : base;
}

function refreshBookingForm() {
    const ta = document.getElementById('booking-template');
    if (ta) { ta.value = bookingTemplateValue(); autosizeTemplate(); }
    updateBookingContactLinks();
}

function setBookingCustom(on) {
    bookingState.custom = !!on;
    refreshBookingForm();
}

// E-mail can carry the whole filled form automatically (subject + body).
// Instagram/Kakao can't be pre-filled by a link, so we copy the form to the
// clipboard when those are tapped — the user just pastes it in the chat.
function updateBookingContactLinks() {
    const ta = document.getElementById('booking-template');
    const emailBtn = document.querySelector('.contact-btn.email');
    if (!ta || !emailBtn) return;
    const subject = (currentLanguage === 'ko') ? '예약 문의 — mura' : 'Booking enquiry — mura';
    emailBtn.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(ta.value)}`;
}

function copyForChat() {
    const ta = document.getElementById('booking-template');
    if (!ta) return;
    try { navigator.clipboard.writeText(ta.value); } catch (e) { ta.select(); document.execCommand('copy'); }
    showToast(currentLanguage === 'ko' ? '복사됐어요 — 채팅에 붙여넣어 주세요' : 'Copied — paste it into the chat');
}

// "send" -> native share sheet (mobile): pick KakaoTalk / Instagram / Messages
// and the filled form goes straight into the chat. Falls back to copy on desktop.
function sendBooking() {
    const ta = document.getElementById('booking-template');
    const text = ta ? ta.value : '';
    if (navigator.share) {
        navigator.share({ text }).catch(() => {});
        return;
    }
    copyForChat();
}

function showToast(msg) {
    let t = document.getElementById('copy-toast');
    if (!t) { t = document.createElement('div'); t.id = 'copy-toast'; t.className = 'copy-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

function renderBookingPage() {
    const mount = document.getElementById('booking-page');
    if (!mount) return;

    const p = new URLSearchParams(location.search);
    const design = p.get('design') || '';
    const img = p.get('img') || '';
    bookingState = { designs: (design || img) ? [{ design, img }] : [], custom: false };

    mount.innerHTML = bookingContentHTML();

    // Show the chosen design (if the visitor came from a design's enquiry link).
    if (img) {
        const fig = document.createElement('figure');
        fig.className = 'booking-selected';
        fig.innerHTML = `<img src="${thumbURL(img, 700)}" alt="" draggable="false">` +
            `<figcaption data-en="the design you're asking about" data-ko="문의하시는 도안">the design you're asking about</figcaption>`;
        mount.insertBefore(fig, mount.querySelector('.booking-custom'));
    }

    const ta = document.getElementById('booking-template');
    if (ta) ta.value = bookingTemplateValue();
    updateBookingContactLinks();
    requestAnimationFrame(autosizeTemplate);
}

// Shrink the template box to fit its text (no empty space). Only when visible.
function autosizeTemplate() {
    const ta = document.getElementById('booking-template');
    if (!ta || !ta.offsetParent) return;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
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
        setTimeout(() => { btn.textContent = prev; btn.classList.remove('copied'); }, 1000);
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
            ${ANNOUNCEMENT_HTML}
        </div>`;
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
    const switchLabel = currentLanguage === 'ko' ? 'switch to 🇬🇧' : 'switch to 🇰🇷';
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

// Watermark is now the CSS backdrop of .menu-bars (see style.css).

document.addEventListener('keydown', (e) => {
    const lbOpen = document.getElementById('lightbox')?.classList.contains('open');
    if (e.key === 'Escape') {
        if (lbOpen) closeLightbox();
        else if (drawerStack.length) closeDrawer();
        else closeAnnounce();
    }
    if (lbOpen && e.key === 'ArrowLeft') lbStep(-1);
    if (lbOpen && e.key === 'ArrowRight') lbStep(1);
});

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
// Korean main-page (home) menu text orientation. Try: 'spaced' (letters stacked
// upright with space between them), 'rotated' (the word turned 90°), or 'off'.
const KO_MENU_VERTICAL = 'spaced';

const MARQUEE_SPEED = 90; // px per second
// Per-bar horizontal start offset (px) so the bars don't all line up.
const MARQUEE_OFFSETS = [-15, -180, -90, -260, -45, -200, -120, -310];

// ===== Looping menu marquee =====
function buildMarquees() {
    // Vertical Korean treatment on the home menus (see KO_MENU_VERTICAL).
    const home = document.querySelector('.menu-bars--home');
    if (home) {
        const mode = (currentLanguage === 'ko') ? KO_MENU_VERTICAL : 'off';
        home.classList.toggle('ko-vert', mode === 'spaced' || mode === 'rotated');
        home.classList.toggle('ko-vert-spaced', mode === 'spaced');
        home.classList.toggle('ko-vert-rotated', mode === 'rotated');
    }

    let index = -1;
    document.querySelectorAll('.menu-bar').forEach(bar => {
        const menuText = bar.querySelector('.menu-text');
        if (!menuText) return;
        if (bar.offsetParent === null) { menuText.innerHTML = ''; return; }
        index++;

        const label = bar.getAttribute('data-' + currentLanguage) || bar.getAttribute('data-en') || '';
        const W = Math.round(menuText.clientWidth);
        if (!W) return;
        const offset = (MARQUEE_OFFSETS[index % MARQUEE_OFFSETS.length] || 0);

        menuText.innerHTML = '';

        // Seamless two-segment marquee.
        const track = document.createElement('div');
        track.className = 'marquee';
        track.style.marginLeft = offset + 'px';
        for (let s = 0; s < 2; s++) {
            const seg = document.createElement('span');
            seg.className = 'marquee-seg';
            if (s === 1) seg.setAttribute('aria-hidden', 'true');
            for (let i = 0; i < 8; i++) {
                const w = document.createElement('span');
                w.className = 'marquee-word';
                w.textContent = label;
                seg.appendChild(w);
            }
            track.appendChild(seg);
        }
        menuText.appendChild(track);

        const segWidth = track.firstChild.getBoundingClientRect().width;
        if (segWidth > 0) track.style.animationDuration = (segWidth / MARQUEE_SPEED) + 's';
    });
}

// ===== Image helpers =====
function pad2(n) { return String(n).padStart(2, '0'); }

// Build a design's full image list from its gallery.js entry.
function designItems(d) {
    const ext = d.ext || 'png';
    const count = Math.max(0, parseInt(d.count, 10) || 0);
    const items = [];
    for (let i = 1; i <= count; i++) {
        items.push({ src: `${d.folder}/${pad2(i)}.${ext}`, caption: d.caption || null, code: d.code || '' });
    }
    return items;
}

function allDesigns() {
    const g = window.GALLERY || {};
    return [].concat(Array.isArray(g.available) ? g.available : [], Array.isArray(g.archive) ? g.archive : []);
}

// Grid images are routed through a free image-resizing CDN so the page loads
// small, fast thumbnails instead of the full 1-2 MB originals. The viewer
// always uses the full-resolution original. Set USE_IMAGE_CDN = false to turn
// this off (e.g. if you'd rather pre-resize images yourself).
const USE_IMAGE_CDN = true;
function thumbURL(src, w) {
    if (!USE_IMAGE_CDN) return src;
    try {
        const abs = new URL(src, location.href);
        // Only proxy real public hosts (skip local previews / file://).
        if (abs.protocol !== 'https:' && abs.protocol !== 'http:') return src;
        if (/^(localhost|127\.|0\.0\.0\.0|192\.168\.)/.test(abs.hostname) || !abs.hostname.includes('.')) return src;
        const ref = 'ssl:' + abs.host + abs.pathname;
        return `https://images.weserv.nl/?url=${encodeURIComponent(ref)}&w=${w || 600}&output=webp&q=72`;
    } catch (e) {
        return src;
    }
}

// ===== Config-driven design grid (Instagram-style: one post per design) =====
// Reads window.GALLERY from gallery.js. Each design is one square (its cover);
// tapping it opens that design's own page (design.html).
function loadDesignGrid(grid) {
    const coll = grid.getAttribute('data-collection');
    const designs = (window.GALLERY && Array.isArray(window.GALLERY[coll])) ? window.GALLERY[coll] : [];
    const frag = document.createDocumentFragment();

    designs.forEach(d => {
        const items = designItems(d);
        if (!d.folder || !items.length) return;
        const a = document.createElement('a');
        a.className = 'image-tile loading';
        a.href = `design.html?id=${encodeURIComponent(d.folder)}&c=${coll}`;
        const img = document.createElement('img');
        img.src = thumbURL(items[0].src, 600);   // cover, small/fast thumbnail
        img.alt = (d.caption && (d.caption.en || d.caption.ko)) || 'design';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.addEventListener('load', () => a.classList.remove('loading'));
        img.addEventListener('error', () => a.classList.remove('loading'));
        a.appendChild(img);
        frag.appendChild(a);
    });

    if (!frag.childNodes.length) {
        const f = document.createElement('figure');
        f.className = 'image-tile is-placeholder';
        f.innerHTML = '<span class="placeholder-label">Coming soon</span>';
        grid.appendChild(f);
        return;
    }
    grid.appendChild(frag);
}

// Available <-> archive tabs above a grid (designs page).
function setupGridTabs() {
    document.querySelectorAll('.grid-tabs').forEach(tabs => {
        const grid = tabs.parentElement.querySelector('.image-grid[data-collection]');
        if (!grid) return;
        tabs.querySelectorAll('.grid-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                if (grid.getAttribute('data-collection') === btn.dataset.collection) return;
                grid.setAttribute('data-collection', btn.dataset.collection);
                grid.innerHTML = '';
                loadDesignGrid(grid);
                tabs.querySelectorAll('.grid-tab').forEach(b => b.classList.toggle('is-active', b === btn));
            });
        });
    });
}

// ===== Design page (design.html?id=<folder>) =====
// Shows one design's images (tap to zoom/swipe) + a "book this design" button.
function renderDesignPage() {
    const mount = document.getElementById('design-page');
    if (!mount) return;
    const p = new URLSearchParams(location.search);
    const id = p.get('id');
    const d = allDesigns().find(x => x.folder === id) || allDesigns()[0];
    if (!d) { mount.innerHTML = '<p class="modal-intro">Design not found.</p>'; return; }

    const items = designItems(d);
    const title = captionText(d.caption) || 'design';
    const isArchive = (window.GALLERY.archive || []).some(x => x.folder === id);
    const codeLine = d.code
        ? `<p class="design-code"><span data-en="design code" data-ko="도안 코드">design code</span>: <strong>${d.code}</strong></p>`
        : '';

    mount.innerHTML =
        '<div class="project-desc"><span class="desc-label"><span class="dot"></span>' +
        `<span>${title}</span></span></div>` +
        codeLine +
        '<div class="design-images"></div>' +
        '<div class="design-cta"></div>';

    const wrap = mount.querySelector('.design-images');
    items.forEach((item, idx) => {
        const fig = document.createElement('figure');
        fig.className = 'design-img loading';
        const img = document.createElement('img');
        img.src = thumbURL(item.src, 900);
        img.alt = title;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.addEventListener('load', () => fig.classList.remove('loading'));
        img.addEventListener('error', () => fig.classList.remove('loading'));
        fig.appendChild(img);
        fig.addEventListener('click', () => openLightbox(items, idx));
        wrap.appendChild(fig);
    });

    const cta = mount.querySelector('.design-cta');
    const ko = currentLanguage === 'ko';
    if (isArchive) {
        cta.innerHTML = `<a class="design-enquire" href="availables.html">${ko ? '솔드아웃 — 다른 도안 보기' : 'sold out — see other designs'}</a>`;
    } else {
        // Understated enquiry link (gallery-first; not a hard sell).
        const a = document.createElement('a');
        a.className = 'design-enquire';
        a.textContent = ko ? '이 도안 문의하기 →' : 'enquire about this design →';
        a.href = '#';
        a.addEventListener('click', (e) => { e.preventDefault(); bookItem(items[0]); });
        cta.appendChild(a);
    }
}

// ===== Cascading subpage drawers (open ~4/5 width over the previous page) =====
const drawerStack = [];

function ensureScrim() {
    let s = document.getElementById('drawer-scrim');
    if (!s) {
        s = document.createElement('div');
        s.id = 'drawer-scrim';
        s.className = 'drawer-scrim';
        s.addEventListener('click', closeDrawer);
        document.body.appendChild(s);
    }
    return s;
}

function openDrawer(innerHTML) {
    ensureScrim().classList.add('show');
    const d = document.createElement('div');
    d.className = 'drawer';
    d.innerHTML = '<button class="drawer-close" type="button" aria-label="Back">←</button>' +
        `<div class="drawer-body">${innerHTML}</div>`;
    document.body.appendChild(d);
    drawerStack.push(d);
    d.querySelector('.drawer-close').addEventListener('click', (e) => { e.stopPropagation(); closeDrawer(); });
    d.addEventListener('click', (e) => {
        // clicking the exposed strip of a drawer that isn't on top pops back to it
        if (drawerStack[drawerStack.length - 1] !== d) { e.stopPropagation(); closeToDrawer(d); }
    });
    requestAnimationFrame(() => { d.classList.add('open'); layoutDrawers(); });
    document.body.classList.add('modal-open');
    return d.querySelector('.drawer-body');
}

function layoutDrawers() {
    const peek = 7; // vw of each lower drawer kept visible on the left
    const n = drawerStack.length;
    drawerStack.forEach((d, i) => {
        const depth = n - 1 - i;          // 0 = top
        d.style.zIndex = 2000 + i;
        d.style.setProperty('--peek', (depth * peek) + 'vw');
        d.classList.toggle('behind', depth > 0);
    });
}

function closeDrawer() {
    const d = drawerStack.pop();
    if (!d) return;
    d.classList.remove('open', 'behind');
    d.classList.add('closing');
    setTimeout(() => d.remove(), 280);
    layoutDrawers();
    if (!drawerStack.length) {
        document.getElementById('drawer-scrim')?.classList.remove('show');
        document.body.classList.remove('modal-open');
    }
}

function closeToDrawer(target) {
    while (drawerStack.length && drawerStack[drawerStack.length - 1] !== target) closeDrawer();
}

// ----- Availables: two category menus -> design list -> design images -----
function categoryDesigns(cat) { return allDesigns().filter(d => (d.category || '') === cat); }

function renderAvailables() {
    document.querySelectorAll('.cat-item').forEach(btn => {
        btn.addEventListener('click', () => openCategoryDrawer(btn.dataset.cat));
    });
}

function openCategoryDrawer(cat) {
    const ko = currentLanguage === 'ko';
    const heading = cat === 'muratypes' ? (ko ? '무라체' : 'mura-types') : (ko ? '에피소드' : 'episodes');
    const body = openDrawer(`<h2 class="drawer-title">${heading}</h2><div class="image-grid"></div>`);
    const grid = body.querySelector('.image-grid');
    categoryDesigns(cat).forEach(d => {
        const items = designItems(d);
        if (!items.length) return;
        const a = document.createElement('a');
        a.className = 'image-tile loading';
        a.href = '#';
        const img = document.createElement('img');
        img.src = thumbURL(items[0].src, 600);
        img.alt = (d.caption && (d.caption.en || d.caption.ko)) || 'design';
        img.loading = 'lazy'; img.decoding = 'async';
        img.addEventListener('load', () => a.classList.remove('loading'));
        img.addEventListener('error', () => a.classList.remove('loading'));
        a.appendChild(img);
        a.addEventListener('click', (e) => { e.preventDefault(); openDesignDrawer(d); });
        grid.appendChild(a);
    });
}

function openDesignDrawer(d) {
    const ko = currentLanguage === 'ko';
    const items = designItems(d);
    const title = captionText(d.caption) || 'design';
    const code = d.code ? `<p class="design-code"><span>${ko ? '도안 코드' : 'design code'}</span>: <strong>${d.code}</strong></p>` : '';
    const body = openDrawer(`<h2 class="drawer-title">${title}</h2>${code}<div class="design-images"></div><div class="design-cta"></div>`);
    const wrap = body.querySelector('.design-images');
    items.forEach((item, idx) => {
        const fig = document.createElement('figure');
        fig.className = 'design-img loading';
        const img = document.createElement('img');
        img.src = thumbURL(item.src, 900);
        img.alt = title; img.loading = 'lazy'; img.decoding = 'async';
        img.addEventListener('load', () => fig.classList.remove('loading'));
        img.addEventListener('error', () => fig.classList.remove('loading'));
        fig.appendChild(img);
        fig.addEventListener('click', () => openLightbox(items, idx));
        wrap.appendChild(fig);
    });
    const a = document.createElement('a');
    a.className = 'design-enquire';
    a.href = '#';
    a.textContent = ko ? '이 도안 문의하기 →' : 'enquire about this design →';
    a.addEventListener('click', (e) => { e.preventDefault(); bookItem(items[0]); });
    body.querySelector('.design-cta').appendChild(a);
}

// ----- Info / notice drawer (opened from the header) -----
function openInfoDrawer() {
    const body = openDrawer('<p class="modal-intro">…</p>');
    fetch('notice.html')
        .then(r => r.text())
        .then(html => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const main = doc.querySelector('main.container');
            body.innerHTML = main ? main.innerHTML : '';
            applyLanguage(currentLanguage);
        })
        .catch(() => { body.innerHTML = '<p class="modal-intro">Unavailable.</p>'; });
}

// ===== Lightbox carousel (swipe versions, zoom, caption) =====
const lb = { items: [], index: 0, scale: 1, tx: 0, ty: 0 };

function openLightbox(items, index) {
    if (typeof items === 'string') items = [{ src: items, caption: null }]; // legacy single-image
    lb.items = items || [];
    lb.index = index || 0;
    const el = document.getElementById('lightbox') || buildLightbox();
    renderLightbox();
    el.classList.add('open');
    document.body.classList.add('modal-open');
}

function buildLightbox() {
    const el = document.createElement('div');
    el.id = 'lightbox';
    el.className = 'lightbox';
    el.innerHTML =
        '<button class="lb-close" type="button" aria-label="Close">&times;</button>' +
        '<button class="lb-nav lb-prev" type="button" aria-label="Previous">&#8249;</button>' +
        '<div class="lb-stage"><img alt="" draggable="false"></div>' +
        '<button class="lb-nav lb-next" type="button" aria-label="Next">&#8250;</button>' +
        '<div class="lb-meta">' +
            '<p class="lb-caption"></p>' +
            '<span class="lb-count"></span>' +
            '<button class="lb-book" type="button" data-en="book this design" data-ko="이 도안 예약하기">book this design</button>' +
        '</div>';
    document.body.appendChild(el);

    el.querySelector('.lb-close').addEventListener('click', closeLightbox);
    el.querySelector('.lb-prev').addEventListener('click', () => lbStep(-1));
    el.querySelector('.lb-next').addEventListener('click', () => lbStep(1));
    el.querySelector('.lb-book').addEventListener('click', bookCurrentImage);

    // One pointer handler covers tap-to-zoom, drag-to-pan and swipe-to-change.
    const stage = el.querySelector('.lb-stage');
    let down = false, sx = 0, sy = 0, lx = 0, ly = 0, moved = 0, startTarget = null;
    stage.addEventListener('pointerdown', (e) => {
        down = true; startTarget = e.target;
        sx = lx = e.clientX; sy = ly = e.clientY; moved = 0;
        try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    });
    stage.addEventListener('pointermove', (e) => {
        if (!down) return;
        const dx = e.clientX - lx, dy = e.clientY - ly;
        lx = e.clientX; ly = e.clientY;
        moved += Math.abs(dx) + Math.abs(dy);
        if (lb.scale > 1) { lb.tx += dx; lb.ty += dy; applyZoom(); }
    });
    stage.addEventListener('pointerup', (e) => {
        if (!down) return;
        down = false;
        const totalX = e.clientX - sx, totalY = e.clientY - sy;
        if (lb.scale > 1) {
            if (moved < 6) resetZoom();                 // tap while zoomed -> zoom out
            return;
        }
        if (Math.abs(totalX) > 45 && Math.abs(totalX) > Math.abs(totalY)) {
            lbStep(totalX < 0 ? 1 : -1);                // horizontal swipe
        } else if (moved < 6) {
            if (startTarget === stage.querySelector('img')) zoomIn(); // tap image -> zoom in
            else closeLightbox();                       // tap backdrop -> close
        }
    });
    return el;
}

function renderLightbox() {
    const el = document.getElementById('lightbox');
    if (!el) return;
    const item = lb.items[lb.index] || {};
    el.querySelector('img').src = item.src || '';
    const cap = captionText(item.caption);
    const capEl = el.querySelector('.lb-caption');
    capEl.textContent = cap;
    capEl.style.display = cap ? '' : 'none';
    el.querySelector('.lb-count').textContent =
        lb.items.length > 1 ? `${lb.index + 1} / ${lb.items.length}` : '';
    el.querySelector('.lb-book').textContent =
        (currentLanguage === 'ko') ? '이 도안 예약하기' : 'book this design';
    el.classList.toggle('single', lb.items.length <= 1);
    resetZoom();
}

function captionText(cap) {
    if (!cap) return '';
    if (typeof cap === 'string') return cap;
    return cap[currentLanguage] || cap.en || cap.ko || '';
}

function lbStep(dir) {
    if (!lb.items.length) return;
    lb.index = (lb.index + dir + lb.items.length) % lb.items.length;
    renderLightbox();
}

function zoomIn() { lb.scale = 2.4; lb.tx = 0; lb.ty = 0; applyZoom(); }
function resetZoom() { lb.scale = 1; lb.tx = 0; lb.ty = 0; applyZoom(); }
function applyZoom() {
    const el = document.getElementById('lightbox');
    if (!el) return;
    el.querySelector('img').style.transform =
        `translate(${lb.tx}px, ${lb.ty}px) scale(${lb.scale})`;
    el.classList.toggle('is-zoomed', lb.scale > 1);
}

function closeLightbox() {
    const el = document.getElementById('lightbox');
    if (el) { el.classList.remove('open'); document.body.classList.remove('modal-open'); }
    resetZoom();
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
    renderHeader();
    renderBookingPage();
    renderDesignPage();
    renderFooter();
    renderBackToTop();

    // Build + show the opening popup only when it will actually appear.
    if (!sessionStorage.getItem('announceSeen')) {
        renderAnnouncement();
        openAnnounce();
    }

    applyLanguage(currentLanguage);
    buildMarquees();
    renderAvailables();
    document.querySelectorAll('.image-grid[data-collection]').forEach(loadDesignGrid);
    setupGridTabs();
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
