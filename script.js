// ===== Booking template (copied to clipboard from the Book Now popup) =====
const BOOKING_TEMPLATE = `Name:
Instagram: @
City / Country:
Design idea:
Approx. size (cm):
Placement on body:
Budget:
Preferred dates:
(Attach reference images in your message)`;

// KakaoTalk open-chat / channel link. Leave empty until provided.
const KAKAO_URL = '';
const INSTAGRAM_URL = 'https://instagram.com/murarctic';

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
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    applyLanguage(lang);
    buildMarquees(); // labels may have changed length -> rebuild
}

// ===== Shared header (injected into #site-header on every page) =====
function renderHeader() {
    const mount = document.getElementById('site-header');
    if (!mount) return;

    mount.className = 'site-header';
    mount.innerHTML = `
        <div class="header-left">
            <a href="index.html" class="site-name">mura</a>
            <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener" class="site-handle">@murarctic</a>
        </div>
        <div class="header-center">
            <button type="button" class="book-now-btn" onclick="openBooking()" data-en="Book Now" data-ko="예약하기">Book Now</button>
        </div>
        <nav class="lang-selector">
            <button class="lang-btn" onclick="setLanguage('en')" data-lang="en">EN</button>
            <button class="lang-btn" onclick="setLanguage('ko')" data-lang="ko">KO</button>
        </nav>`;
}

// ===== Booking modal =====
function renderBookingModal() {
    if (document.getElementById('booking-modal')) return;

    const kakaoBtn = KAKAO_URL
        ? `<a class="contact-btn kakao" href="${KAKAO_URL}" target="_blank" rel="noopener">KakaoTalk</a>`
        : `<span class="contact-btn kakao disabled" title="Link coming soon">KakaoTalk (soon)</span>`;

    const overlay = document.createElement('div');
    overlay.id = 'booking-modal';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-label="Booking">
            <button class="modal-close" onclick="closeBooking()" aria-label="Close">&times;</button>
            <h2 class="modal-title" data-en="Book with mura" data-ko="무라와 예약하기">Book with mura</h2>
            <p class="modal-intro" data-en="Copy the template, fill it in, and send it to me on Instagram DM or KakaoTalk." data-ko="아래 양식을 복사해 작성한 뒤 인스타그램 DM 또는 카카오톡으로 보내주세요.">Copy the template, fill it in, and send it to me on Instagram DM or KakaoTalk.</p>
            <div class="booking-template-wrap">
                <textarea id="booking-template" class="booking-template" rows="9" readonly></textarea>
                <button class="copy-btn" onclick="copyTemplate()" data-en="Copy template" data-ko="양식 복사">Copy template</button>
            </div>
            <div class="contact-options">
                <a class="contact-btn ig" href="${INSTAGRAM_URL}" target="_blank" rel="noopener">Instagram DM</a>
                ${kakaoBtn}
            </div>
        </div>`;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeBooking(); });
    document.body.appendChild(overlay);
    document.getElementById('booking-template').value = BOOKING_TEMPLATE;
}

function openBooking() {
    const m = document.getElementById('booking-modal');
    if (m) { m.classList.add('open'); document.body.classList.add('modal-open'); }
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

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeBooking(); });

// ===== Seamless looping menu marquee =====
// Each .menu-bar carries data-en/ko/jp labels. We render two identical
// segments side by side and slide the track by exactly one segment width,
// so the loop never visibly "refreshes".
const MARQUEE_SPEED = 120; // px per second
// Per-bar horizontal start offset (px) so the bars don't all line up.
const MARQUEE_OFFSETS = [-15, -180, -90, -260];

function buildMarquees() {
    document.querySelectorAll('.menu-bar').forEach((bar, index) => {
        const label = bar.getAttribute('data-' + currentLanguage) || bar.getAttribute('data-en') || '';
        const menuText = bar.querySelector('.menu-text');
        if (!menuText) return;

        const makeSegment = () => {
            const seg = document.createElement('span');
            seg.className = 'marquee-seg';
            for (let i = 0; i < 8; i++) {
                const word = document.createElement('span');
                word.className = 'marquee-word';
                word.textContent = label;
                seg.appendChild(word);
            }
            return seg;
        };

        const track = document.createElement('div');
        track.className = 'marquee';
        // Stagger the starting text position (not the animation timing).
        track.style.marginLeft = (MARQUEE_OFFSETS[index % MARQUEE_OFFSETS.length]) + 'px';
        const seg1 = makeSegment();
        const seg2 = makeSegment();
        seg2.setAttribute('aria-hidden', 'true');
        track.appendChild(seg1);
        track.appendChild(seg2);

        menuText.innerHTML = '';
        menuText.appendChild(track);

        // Constant speed regardless of word length: duration scales with width.
        const segWidth = seg1.getBoundingClientRect().width;
        if (segWidth > 0) {
            track.style.animationDuration = (segWidth / MARQUEE_SPEED) + 's';
        }
    });
}

// ===== Init =====
function init() {
    renderHeader();
    renderBookingModal();
    applyLanguage(currentLanguage);
    buildMarquees();
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
