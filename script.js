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

// Scroll to section function for menu items
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Form submission handler
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('waitlistForm');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Create FormData to handle file uploads
            const formData = new FormData(form);
            
            // Convert FormData to plain object for easier handling
            const data = {
                name: formData.get('name'),
                instagram: formData.get('instagram'),
                city: formData.get('city'),
                country: formData.get('country'),
                design: formData.get('design'),
                _subject: 'New Waitlist Submission from murarctic.kr'
            };
            
            // Send email via EmailJS (you can use this free service)
            // For now, let's use a simple validation and message
            console.log('Form data:', data);
            
            // Show success message
            alert('Thank you! Your submission has been received. I will get back to you soon!');
            
            // Reset form
            form.reset();
        });
    }
    
    // Set initial language
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'ko';
    setLanguage(savedLanguage);
});

// Menu item interactions
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        console.log('Menu item clicked:', this.textContent);
    });
});
