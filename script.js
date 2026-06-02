// Language switching functionality
let currentLanguage = 'ko'; // Default to Korean

function setLanguage(lang) {
    currentLanguage = lang;
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // Update all content with data attributes
    document.querySelectorAll('[data-en], [data-ko], [data-jp]').forEach(element => {
        if (lang === 'en' && element.getAttribute('data-en')) {
            element.textContent = element.getAttribute('data-en');
        } else if (lang === 'ko' && element.getAttribute('data-ko')) {
            element.textContent = element.getAttribute('data-ko');
        } else if (lang === 'jp' && element.getAttribute('data-jp')) {
            element.textContent = element.getAttribute('data-jp');
        }
    });
    
    // Save to localStorage
    localStorage.setItem('preferredLanguage', lang);
}

// Load saved language preference on page load
window.addEventListener('load', () => {
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'ko';
    setLanguage(savedLanguage);
});

// Form submission handler with Formspree
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('waitlistForm');
    
    if (form) {
        // You'll need to replace 'YOUR_FORM_ID' with your actual Formspree form ID
        // Get this by creating a form at https://formspree.io/
        form.addEventListener('submit', (e) => {
            // Allow Formspree to handle the submission
            // The form will be submitted to Formspree endpoint
        });
    }
    
    // Set initial language
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'ko';
    setLanguage(savedLanguage);
});

// Menu item interactions
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        // Add any menu item click functionality here
        console.log('Menu item clicked:', item.textContent);
    });
});
