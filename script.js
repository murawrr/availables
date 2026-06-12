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
const ANNOUNCEMENT_HTML = `
    <img class="announce-cover" alt="" draggable="false" hidden>
    <!-- Step 1: pick a language -->
    <div class="announce-step announce-step--lang">
        <h3 class="announce-h">select language<span class="announce-sub">언어 선택</span></h3>
        <div class="announce-langs">
            <button type="button" class="announce-lang" onclick="pickAnnounceLanguage('en')">English</button>
            <button type="button" class="announce-lang" onclick="pickAnnounceLanguage('ko')">한국어</button>
        </div>
    </div>

    <!-- Step 2: available-dates calendar -->
    <div class="announce-step announce-step--schedule" hidden>
        <h3 class="announce-h" data-en="available dates" data-ko="예약 가능 날짜">available dates</h3>
        <p class="announce-hint" data-en="click a date to book it" data-ko="원하는 날짜를 눌러 예약하세요">click a date to book it</p>
        <div class="announce-cal"></div>
        <div class="announce-legend">
            <span class="leg leg--seoul" data-en="Seoul" data-ko="서울">Seoul</span>
            <span class="leg leg--busan" data-en="Busan" data-ko="부산">Busan</span>
            <span class="leg leg--jeju" data-en="Jeju" data-ko="제주">Jeju</span>
        </div>
        <div class="announce-actions">
            <button type="button" class="announce-action" onclick="announceWaitlist()" data-en="waitlist" data-ko="대기 신청">waitlist</button>
            <button type="button" class="announce-action" onclick="announceDesigns()" data-en="see designs" data-ko="도안 보기">see designs</button>
        </div>
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

// Opening popup step 1 -> apply the chosen language and reveal the calendar.
function pickAnnounceLanguage(lang) {
    setLanguage(lang);
    const m = document.getElementById('announce-modal');
    if (!m) return;
    m.querySelector('.announce-step--lang').hidden = true;
    m.querySelector('.announce-step--schedule').hidden = false;
    buildAnnounceCalendar(m.querySelector('.announce-cal'));
}

// Step 3 of the opening popup: the three choices after the calendar.
function announceBook() {
    sessionStorage.setItem('announceSeen', '1');
    window.location.href = 'booking.html';
}

function announceWaitlist() {
    sessionStorage.setItem('announceSeen', '1');
    window.location.href = 'waitlist.html';
}

function announceDesigns() {
    const onHome = /(^|\/)(index\.html)?$/.test(location.pathname);
    if (onHome) {
        closeAnnounce();
    } else {
        sessionStorage.setItem('announceSeen', '1');
        window.location.href = 'index.html';
    }
}

// ===== Availability calendar (shown in the opening popup) =====
// Months + available dates come from schedule.js (window.SCHEDULE).
function getSchedule() {
    const s = window.SCHEDULE;
    if (s && Array.isArray(s.months) && s.months.length) {
        return { months: s.months, dates: Array.isArray(s.dates) ? s.dates : [] };
    }
    return { months: ['2026-06', '2026-07'], dates: [] };
}

function normPlace(p) {
    p = String(p || '').toLowerCase();
    return (p === 'busan' || p === 'jeju') ? p : 'seoul';
}

// Look up an available date entry for a given day, or null.
function dateInfoFor(sched, year, month, day) {
    const key = `${year}-${pad2(month)}-${pad2(day)}`;
    return (sched.dates || []).find(x => x.date === key) || null;
}

// Click "book this design" in the image viewer -> booking page with the design
// reference (name + image link) pre-filled into the form.
function bookCurrentImage() {
    const item = lb.items[lb.index];
    if (!item) return;
    sessionStorage.setItem('announceSeen', '1');
    const q = new URLSearchParams();
    const cap = captionText(item.caption);
    if (cap) q.set('design', cap);
    if (item.src) q.set('img', new URL(item.src, location.href).href);
    window.location.href = 'booking.html?' + q.toString();
}

// Click an available date -> booking page with the date pre-filled.
function bookDate(info) {
    sessionStorage.setItem('announceSeen', '1');
    const q = new URLSearchParams({ date: info.date });
    if (info.place) q.set('place', info.place);
    if (info.time) q.set('time', info.time);
    window.location.href = 'booking.html?' + q.toString();
}

function buildAnnounceCalendar(container) {
    if (!container) return;
    container.innerHTML = '';
    const sched = getSchedule();
    sched.months.forEach(ym => {
        const [year, month] = String(ym).split('-').map(Number);
        if (year && month) container.appendChild(buildCalMonth(sched, year, month));
    });
}

function buildCalMonth(sched, year, month) {
    const ko = currentLanguage === 'ko';
    const monthsEn = ['', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dow = ko ? ['일', '월', '화', '수', '목', '금', '토']
                   : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const wrap = document.createElement('div');
    wrap.className = 'cal-month';

    const title = document.createElement('div');
    title.className = 'cal-title';
    title.textContent = ko ? `${year}년 ${month}월` : `${monthsEn[month]} ${year}`;
    wrap.appendChild(title);

    const head = document.createElement('div');
    head.className = 'cal-grid cal-dow';
    dow.forEach(d => {
        const c = document.createElement('span');
        c.className = 'cal-dow-cell';
        c.textContent = d;
        head.appendChild(c);
    });
    wrap.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'cal-grid';
    const startDay = new Date(year, month - 1, 1).getDay();        // 0 = Sunday
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let i = 0; i < startDay; i++) {
        const blank = document.createElement('span');
        blank.className = 'cal-cell cal-blank';
        grid.appendChild(blank);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const info = dateInfoFor(sched, year, month, day);
        const cell = document.createElement('span');
        if (info) {
            cell.className = `cal-cell is-available cal--${normPlace(info.place)}`;
            cell.innerHTML = `<span class="cal-d">${day}</span>` +
                (info.time ? '<span class="cal-dot" aria-hidden="true"></span>' : '');
            cell.setAttribute('role', 'button');
            cell.tabIndex = 0;
            cell.title = info.time ? `${info.date} · ${info.time}` : info.date;
            cell.addEventListener('click', () => bookDate(info));
            cell.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bookDate(info); }
            });
        } else {
            cell.className = 'cal-cell cal-off';
            cell.textContent = day;
        }
        grid.appendChild(cell);
    }
    wrap.appendChild(grid);
    return wrap;
}

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
            <a class="header-action" href="booking.html" data-en="book or enquire" data-ko="예약 혹은 문의">book or enquire</a>
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
        <h1 class="booking-title" data-en="book or enquire" data-ko="예약 혹은 문의">book or enquire</h1>
        <div class="booking-policy">
            <h3 class="booking-policy-h" data-en="booking policy" data-ko="예약 규정">booking policy</h3>
            <ul class="booking-policy-list">${policyItems}</ul>
        </div>
        <p class="modal-intro" data-en="To book, copy and fill in the template below — or feel free to ignore it and just ask me a question. Either way, reach me by DM." data-ko="예약을 원하시면 아래 양식을 복사해 작성해 주세요. 양식은 건너뛰고 편하게 질문만 보내주셔도 괜찮습니다. DM 또는 카카오톡으로 연락 주세요.">To book, copy and fill in the template below — or feel free to ignore it and just ask me a question. Either way, reach me by DM.</p>
        <div class="booking-template-wrap">
            <textarea id="booking-template" class="booking-template" rows="5" readonly></textarea>
            <div class="copy-row">
                <button class="copy-btn" onclick="copyTemplate()" data-en="copy" data-ko="복사하기">copy</button>
            </div>
        </div>
        <div class="contact-options">
            <a class="contact-btn ig" href="${INSTAGRAM_URL}" target="_blank" rel="noopener" onclick="copyForChat()">dm</a>
            ${kakaoBtn}
            <a class="contact-btn email" href="mailto:${EMAIL}">e-mail</a>
        </div>
        <p class="modal-foot en-only"><a href="waitlist.html" data-en="Not in your area yet? Join the waitlist →">Not in your area yet? Join the waitlist →</a></p>`;
}

// Booking template text, with "preferred date" and/or "selected design" lines
// prepended when the user arrived from a calendar date or an image
// (booking.html?date=...&time=...&place=...  or  ?design=...&img=...).
function bookingTemplateValue() {
    const base = BOOKING_TEMPLATE[currentLanguage] || BOOKING_TEMPLATE.en;
    const params = new URLSearchParams(location.search);
    const ko = currentLanguage === 'ko';
    const lines = [];

    const date = params.get('date');
    if (date) {
        let line = (ko ? '예약 희망일: ' : 'preferred date: ') + date;
        const time = params.get('time');
        const place = params.get('place');
        if (time) line += ` ${time}`;
        if (place) line += ` (${place})`;
        lines.push(line);
    }

    const design = params.get('design');
    const img = params.get('img');
    if (design || img) {
        let line = ko ? '선택한 도안: ' : 'selected design: ';
        if (design) line += design;
        if (img) line += (design ? ' — ' : '') + img;
        lines.push(line);
    }

    return lines.length ? lines.join('\n') + '\n' + base : base;
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
    mount.innerHTML = bookingContentHTML();

    // Show the chosen image (if the user came from "book this design").
    const img = new URLSearchParams(location.search).get('img');
    if (img) {
        const fig = document.createElement('figure');
        fig.className = 'booking-selected';
        fig.innerHTML = `<img src="${img}" alt="" draggable="false">` +
            `<figcaption data-en="your selected design" data-ko="선택한 도안">your selected design</figcaption>`;
        mount.insertBefore(fig, mount.querySelector('.booking-template-wrap'));
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
    loadAnnounceCover(overlay);
}

// Optional popup image: drop a file named cover.* (or 01.*) into images/popup/.
function loadAnnounceCover(overlay) {
    const img = overlay.querySelector('.announce-cover');
    if (!img) return;
    probeImage('images/popup/cover')
        .then(r => r || probeImage('images/popup/01'))
        .then(r => { if (r) { img.src = r.src; img.hidden = false; } });
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
    if (e.key === 'Escape') { closeAnnounce(); closeLightbox(); }
    const lbOpen = document.getElementById('lightbox')?.classList.contains('open');
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

// ===== Gallery auto-loader (Instagram-style square grid) =====
// Two layouts are supported per .image-grid[data-images="folder"]:
//   * Flat: 01.*, 02.* ... directly in the folder; every image is a square and
//     the viewer swipes through all of them. Optional captions.json
//     ([{"en":"...","ko":"..."}, ...]) gives one caption per image.
//   * Grouped: subfolders 01/, 02/, 03/ ... where each subfolder is one design
//     (one grid square). Inside, 01.*, 02.* ... are the versions you swipe
//     through. An optional caption.json ({"en":"...","ko":"..."}) is shown.
const IMG_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'JPG', 'PNG'];

// Probe one numbered image, trying extensions in PARALLEL (fast). Resolves to
// { src, ext } for the first that loads, or null if none do.
function probeImage(pathNoExt, exts = IMG_EXTS) {
    return new Promise(resolve => {
        let pending = exts.length;
        let done = false;
        exts.forEach(ext => {
            const src = `${pathNoExt}.${ext}`;
            const im = new Image();
            im.onload = () => { if (!done) { done = true; resolve({ src, ext }); } };
            im.onerror = () => { if (--pending === 0 && !done) resolve(null); };
            im.src = src;
        });
    });
}

function fetchJSON(url) {
    return fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null);
}

function pad2(n) { return String(n).padStart(2, '0'); }

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

// Collect the contiguous run prefix/02, prefix/03 ... reusing the known
// extension, probing in parallel batches. Returns the list of srcs.
async function collectSequence(prefix, first) {
    const srcs = [first.src];
    const BATCH = 8;
    let n = 2;
    for (;;) {
        const batch = [];
        for (let k = 0; k < BATCH; k++) {
            batch.push(probeImage(`${prefix}${pad2(n + k)}`, [first.ext]));
        }
        const res = await Promise.all(batch);
        let stop = false;
        for (let j = 0; j < res.length; j++) {
            let r = res[j];
            // confirm a miss with a full-extension probe (handles mixed types)
            if (!r) r = await probeImage(`${prefix}${pad2(n + j)}`);
            if (!r) { stop = true; break; }
            srcs.push(r.src);
        }
        if (stop) break;
        n += BATCH;
    }
    return srcs;
}

async function loadGallery(grid) {
    const folder = grid.getAttribute('data-images');
    if (!folder) return;
    const alt = grid.getAttribute('data-alt') || 'mura';

    // Flat is the common case, so check it first (one parallel probe). Only if
    // there's no flat 01.* do we look for the grouped (subfolder) layout.
    let designs = [];
    const flatFirst = await probeImage(`${folder}/01`);
    if (flatFirst) {
        designs = await collectFlat(folder, flatFirst);
    } else {
        const groupFirst = await probeImage(`${folder}/01/01`);
        if (groupFirst) designs = await collectGrouped(folder, groupFirst);
    }

    if (!designs.length) {
        const fig = document.createElement('figure');
        fig.className = 'image-tile is-placeholder';
        fig.innerHTML = '<span class="placeholder-label">Images coming soon</span>';
        grid.appendChild(fig);
        return;
    }

    const frag = document.createDocumentFragment();
    designs.forEach((design, i) => {
        const start = design.start || 0;
        const fig = document.createElement('figure');
        fig.className = 'image-tile';
        const img = document.createElement('img');
        img.src = thumbURL(design.items[start].src, 600);
        img.alt = `${alt} ${i + 1}`;
        img.loading = 'lazy';
        img.decoding = 'async';
        fig.appendChild(img);
        fig.addEventListener('click', () => openLightbox(design.items, start));
        frag.appendChild(fig);
    });
    grid.appendChild(frag);
}

// ===== Config-driven design grid (fast: no probing) =====
// Reads window.GALLERY from gallery.js. Each design becomes one square; tapping
// it opens that design's own images in the viewer.
function loadDesignGrid(grid) {
    const coll = grid.getAttribute('data-collection');
    const designs = (window.GALLERY && Array.isArray(window.GALLERY[coll])) ? window.GALLERY[coll] : [];
    const frag = document.createDocumentFragment();

    designs.forEach(d => {
        const ext = d.ext || 'png';
        const count = Math.max(0, parseInt(d.count, 10) || 0);
        if (!d.folder || !count) return;
        // Build this design's full image list once; every image is its own square,
        // and clicking any of them opens the viewer scoped to THIS design only.
        const items = [];
        for (let i = 1; i <= count; i++) {
            items.push({ src: `${d.folder}/${pad2(i)}.${ext}`, caption: d.caption || null });
        }
        items.forEach((item, idx) => {
            const fig = document.createElement('figure');
            fig.className = 'image-tile';
            const img = document.createElement('img');
            img.src = thumbURL(item.src, 600);     // small, fast thumbnail
            img.alt = (d.caption && (d.caption.en || d.caption.ko)) || 'design';
            img.loading = 'lazy';
            img.decoding = 'async';
            fig.appendChild(img);
            fig.addEventListener('click', () => openLightbox(items, idx)); // viewer = full-res
            frag.appendChild(fig);
        });
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

// Flat: every image is its own square; the viewer holds them all.
async function collectFlat(folder, first) {
    const srcs = await collectSequence(`${folder}/`, first);
    const captions = await fetchJSON(`${folder}/captions.json`);
    const items = srcs.map((src, i) => ({ src, caption: captions ? captions[i] : null }));
    return items.map((_, i) => ({ items, start: i }));
}

// Grouped: 01/, 02/ ... -> each design carries its own versions + caption.
async function collectGrouped(folder, first) {
    const designs = [];
    let d = 1;
    let cover = first;
    for (;;) {
        const dir = `${folder}/${pad2(d)}`;
        const versions = await collectSequence(`${dir}/`, cover);
        const caption = await fetchJSON(`${dir}/caption.json`);
        designs.push({ items: versions.map(src => ({ src, caption })), start: 0 });
        cover = await probeImage(`${folder}/${pad2(++d)}/01`);
        if (!cover) break;
    }
    return designs;
}

// ===== Listing thumbnails =====
// Each .work-card[data-thumb="folder"] shows the work's first image (01.* or 01/01.*).
function loadThumb(card) {
    const folder = card.getAttribute('data-thumb');
    const thumb = card.querySelector('.thumb');
    if (!folder || !thumb) return;
    probeImage(`${folder}/01`)
        .then(r => r || probeImage(`${folder}/01/01`)) // grouped layout cover
        .then(r => {
            if (!r) return;
            thumb.innerHTML = '';
            const img = document.createElement('img');
            img.src = thumbURL(r.src, 600);
            img.alt = '';
            img.loading = 'lazy';
            img.decoding = 'async';
            thumb.appendChild(img);
        });
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
    renderAnnouncement();
    renderFooter();
    renderBackToTop();
    applyLanguage(currentLanguage);
    buildMarquees();
    document.querySelectorAll('.image-grid[data-collection]').forEach(loadDesignGrid);
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
