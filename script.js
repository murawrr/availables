// Language System
let currentLanguage = 'en';

function setLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;

    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-lang="${lang}"]`).classList.add('active');

    // Update text content
    document.querySelectorAll('[data-en]').forEach(element => {
        if (lang === 'en' && element.getAttribute('data-en')) {
            element.textContent = element.getAttribute('data-en');
        } else if (lang === 'ko' && element.getAttribute('data-ko')) {
            element.textContent = element.getAttribute('data-ko');
        } else if (lang === 'jp' && element.getAttribute('data-jp')) {
            element.textContent = element.getAttribute('data-jp');
        }
    });

    // Update href attributes for contact links
    document.querySelectorAll('.contact-link').forEach(link => {
        if (lang === 'en' && link.getAttribute('data-en')) {
            link.textContent = link.getAttribute('data-en');
        } else if (lang === 'ko' && link.getAttribute('data-ko')) {
            link.textContent = link.getAttribute('data-ko');
        } else if (lang === 'jp' && link.getAttribute('data-jp')) {
            link.textContent = link.getAttribute('data-jp');
        }
    });
}

// Carousel System
const carousels = {};

function initCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;

    const images = carousel.querySelectorAll('img');
    if (images.length === 0) return;

    if (!carousels[carouselId]) {
        carousels[carouselId] = {
            current: 0,
            images: images,
            autoPlayInterval: null
        };
    }

    showSlide(carouselId, 0);
    startAutoPlay(carouselId);
}

function showSlide(carouselId, index) {
    const carousel = carousels[carouselId];
    if (!carousel || carousel.images.length === 0) return;

    // Wrap index
    if (index >= carousel.images.length) {
        carousel.current = 0;
    } else if (index < 0) {
        carousel.current = carousel.images.length - 1;
    } else {
        carousel.current = index;
    }

    // Hide all images
    carousel.images.forEach(img => {
        img.style.display = 'none';
    });

    // Show current image
    carousel.images[carousel.current].style.display = 'block';
}

function nextSlide(carouselId) {
    if (!carousels[carouselId]) return;
    clearInterval(carousels[carouselId].autoPlayInterval);
    showSlide(carouselId, carousels[carouselId].current + 1);
    startAutoPlay(carouselId);
}

function prevSlide(carouselId) {
    if (!carousels[carouselId]) return;
    clearInterval(carousels[carouselId].autoPlayInterval);
    showSlide(carouselId, carousels[carouselId].current - 1);
    startAutoPlay(carouselId);
}

function startAutoPlay(carouselId) {
    if (!carousels[carouselId]) return;

    carousels[carouselId].autoPlayInterval = setInterval(() => {
        showSlide(carouselId, carousels[carouselId].current + 1);
    }, 3000); // 3 seconds
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all carousels
    const allCarousels = document.querySelectorAll('[id^="carousel-"]');
    allCarousels.forEach(carousel => {
        initCarousel(carousel.id);
    });

    // Set default language
    setLanguage('en');
});

// Contact Info (Update these with your actual info)
const contactInfo = {
    instagram: 'https://instagram.com/murarctic',
    kakaoOpenChat: '#', // Add your Kakao OpenChat link
    email: 'mailto:your-email@example.com' // Add your email
};

// Update contact links
document.addEventListener('DOMContentLoaded', () => {
    const contactLinks = document.querySelectorAll('.contact-link');
    contactLinks.forEach((link, index) => {
        if (index === 0) link.href = contactInfo.instagram;
        if (index === 1) link.href = contactInfo.kakaoOpenChat;
        if (index === 2) link.href = contactInfo.email;
    });
});