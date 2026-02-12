// ===== NAVIGATION FUNCTIONALITY =====
// API CONFIGURATION
// API CONFIGURATION
// Only use the API if we are running locally on the server
const USE_API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = 'http://localhost:3000/api';
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// Smooth scrolling handled by CSS scroll-behavior: smooth

// ===== IMAGE SLIDER FUNCTIONALITY =====
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
let slideInterval;

// Show specific slide
function showSlide(index) {
    // Wrap around if index is out of bounds
    if (index >= slides.length) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = index;
    }

    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Add active class to current slide and dot
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

// Change slide (next/previous)
function changeSlide(direction) {
    showSlide(currentSlide + direction);
    resetSlideInterval();
}

// Go to specific slide
function currentSlideFunc(index) {
    showSlide(index);
    resetSlideInterval();
}

// Auto-advance slides
function autoSlide() {
    slideInterval = setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5000); // Change slide every 5 seconds
}

// Reset auto-slide interval
function resetSlideInterval() {
    clearInterval(slideInterval);
    autoSlide();
}

// Start auto-slide on page load
autoSlide();

// Pause auto-slide on hover
const sliderContainer = document.querySelector('.slider-container');
sliderContainer.addEventListener('mouseenter', () => {
    clearInterval(slideInterval);
});

sliderContainer.addEventListener('mouseleave', () => {
    autoSlide();
});

// ===== ENHANCED SCROLL ANIMATIONS =====

// Configuration for Intersection Observer
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

// Create Intersection Observer for scroll animations
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Add animation class based on element type
            const element = entry.target;

            // Determine animation type based on element
            if (element.classList.contains('about-card')) {
                element.classList.add('fade-in-up');
            } else if (element.classList.contains('program-card')) {
                element.classList.add('scale-in');
            } else if (element.classList.contains('info-item')) {
                element.classList.add('fade-in-left');
            } else if (element.classList.contains('section-header')) {
                element.classList.add('reveal-text');
            } else if (element.classList.contains('contact-form')) {
                element.classList.add('fade-in-right');
            } else {
                element.classList.add('fade-in-up');
            }

            // Stop observing after animation is triggered
            scrollObserver.unobserve(element);
        }
    });
}, observerOptions);

// Observe all animatable elements
function initScrollAnimations() {
    // Add scroll-animate class to elements that should animate
    // Removed .pricing-card to prevent disappearing issue
    const animatableElements = document.querySelectorAll(
        '.about-card, .program-card, .info-item, .section-header, .contact-form, .contact-info'
    );

    animatableElements.forEach((el, index) => {
        // Add scroll-animate class to hide initially
        el.classList.add('scroll-animate');

        // Add stagger delay for grouped elements
        if (el.classList.contains('about-card') ||
            el.classList.contains('program-card') ||
            el.classList.contains('info-item')) {
            const staggerIndex = (index % 4) + 1;
            el.classList.add(`stagger-${staggerIndex}`);
        }

        // Start observing
        scrollObserver.observe(el);
    });
}

// Initialize animations when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
    initScrollAnimations();
}

// Additional animation for section titles on scroll
const sectionTitles = document.querySelectorAll('.section-title');
sectionTitles.forEach(title => {
    title.classList.add('scroll-animate');
    scrollObserver.observe(title);
});

// Animate elements on scroll with custom effects
function animateOnScroll() {
    const elements = document.querySelectorAll('.scroll-animate');

    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const windowHeight = window.innerHeight;

        // Check if element is in viewport
        if (elementTop < windowHeight * 0.85 && elementBottom > 0) {
            element.classList.add('fade-in-up');
        }
    });
}

// Throttle scroll events for better performance
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }

    scrollTimeout = window.requestAnimationFrame(() => {
        animateOnScroll();
    });
});


// ===== CONTACT FORM HANDLING =====
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form values
    const formData = new FormData(contactForm);

    // Show success message (you can customize this)
    alert('Thank you for your message! We will get back to you soon.');

    // Reset form
    contactForm.reset();

    // In a real application, you would send this data to a server
    // Example:
    // fetch('/api/contact', {
    //     method: 'POST',
    //     body: formData
    // }).then(response => response.json())
    //   .then(data => console.log(data));
});

// ===== CTA BUTTON FUNCTIONALITY =====
const ctaBtn = document.querySelector('.cta-btn');
ctaBtn.addEventListener('click', () => {
    const pricingSection = document.getElementById('pricing');
    const offsetTop = pricingSection.offsetTop - 80;
    window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
    });
});

// ===== PARALLAX EFFECT FOR HERO =====
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const heroContent = document.querySelector('.hero-content');

    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.opacity = 1 - (scrolled / 600);
    }
});

// ===== LOADING ANIMATION =====
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// ===== PRICING CARD ANIMATION =====
const pricingCard = document.querySelector('.pricing-card');

if (pricingCard) {
    const pricingObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                pricingCard.style.animation = 'fadeInUp 0.8s ease-out';
            }
        });
    }, { threshold: 0.3 });

    pricingObserver.observe(pricingCard);
}

// ===== PROGRAM CARDS HOVER EFFECT =====
const programCards = document.querySelectorAll('.program-card');

programCards.forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ===== COUNTER ANIMATION FOR STATS (if you want to add stats) =====
function animateCounter(element, target, duration) {
    let start = 0;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// ===== KEYBOARD NAVIGATION FOR SLIDER =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        changeSlide(-1);
    } else if (e.key === 'ArrowRight') {
        changeSlide(1);
    }
});

// ===== TOUCH SWIPE FOR MOBILE SLIDER =====
let touchStartX = 0;
let touchEndX = 0;

sliderContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

sliderContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;

    if (touchEndX < touchStartX - swipeThreshold) {
        // Swipe left - next slide
        changeSlide(1);
    }

    if (touchEndX > touchStartX + swipeThreshold) {
        // Swipe right - previous slide
        changeSlide(-1);
    }
}

// ===== PRELOAD IMAGES =====
function preloadImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src) {
            const preloadImg = new Image();
            preloadImg.src = src;
        }
    });
}

preloadImages();

// ===== STATS COUNTER ANIMATION =====
const statNumbers = document.querySelectorAll('.stat-number');
let statsAnimated = false;

function animateStats() {
    if (statsAnimated) return;

    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 4000; // 4 seconds (Slowed down)
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                stat.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                stat.textContent = target + '+';
            }
        };

        updateCounter();
    });

    statsAnimated = true;
}

// Trigger stats animation when stats section is visible
const statsSection = document.querySelector('.stats');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
            }
        });
    }, { threshold: 0.5 });

    statsObserver.observe(statsSection);
}

// ===== SCROLL TO TOP BUTTON =====
const scrollTopBtn = document.getElementById('scrollTop');

// Show/hide scroll to top button
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

// Scroll to top when clicked
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== GALLERY LIGHTBOX EFFECT =====
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach(item => {
    item.addEventListener('click', function () {
        // Add a subtle pulse animation on click
        this.style.animation = 'pulse 0.3s ease';
        setTimeout(() => {
            this.style.animation = '';
        }, 300);
    });
});


// ===== BMI CALCULATOR =====
const bmiForm = document.getElementById('bmiForm');
const bmiDefaultInfo = document.getElementById('bmiDefaultInfo');
const bmiResultCard = document.getElementById('bmiResultCard');
const bmiScore = document.getElementById('bmiScore');
const bmiStatus = document.getElementById('bmiStatus');
const bmiStatusBadge = document.getElementById('bmiStatusBadge');
const bmiGoalText = document.getElementById('bmiGoalText');
const bmiMotivationText = document.getElementById('bmiMotivationText');
const recalculateBtn = document.getElementById('recalculateBtn');

if (bmiForm) {
    bmiForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const weight = parseFloat(document.getElementById('weight').value);
        const feet = parseFloat(document.getElementById('feet').value);
        const inches = parseFloat(document.getElementById('inches').value);

        if (weight > 0 && feet >= 0 && inches >= 0) {
            // Convert Height to Meters: (Feet * 0.3048) + (Inches * 0.0254)
            const heightInMeters = (feet * 0.3048) + (inches * 0.0254);

            // Calculate BMI
            const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

            // Calculate Healthy Weight Range (BMI 18.5 - 24.9)
            const minHealthyWeight = (18.5 * heightInMeters * heightInMeters).toFixed(1);
            const maxHealthyWeight = (24.9 * heightInMeters * heightInMeters).toFixed(1);

            // Hide Default Info & Show Result Card
            bmiDefaultInfo.style.display = 'none';
            bmiResultCard.style.display = 'flex';

            // Display Score
            bmiScore.textContent = bmi;

            // Determine Category, Goal, and Motivation
            let category = '';
            let statusClass = '';
            let goalMessage = '';
            let motivationMessage = '';

            // Reset classes
            bmiStatusBadge.className = 'status-badge';

            if (bmi < 18.5) {
                category = 'Underweight';
                statusClass = 'status-underweight';
                const gainAmount = (minHealthyWeight - weight).toFixed(1);
                goalMessage = `To reach a healthy physique, gain ~${gainAmount} kg. Focus on **Hypertrophy Training** and a calorie surplus to build lean muscle.`;
                motivationMessage = "💪 **Bulk Up!** Building strength takes time. Lift heavy, eat big, and trust the process. Your stronger self is waiting at the rack!";
            } else if (bmi >= 18.5 && bmi <= 24.9) {
                category = 'Normal Weight';
                statusClass = 'status-normal';
                goalMessage = `Perfect! You're in the healthy range. Now focus on **Body Recomposition**—tone up and define your muscles.`;
                motivationMessage = "🔥 **Sculpt Mode!** Fitness isn't just a weight; it's a look and feel. Challenge yourself with progressive overload to carve your dream physique!";
            } else if (bmi >= 25 && bmi <= 29.9) {
                category = 'Overweight';
                statusClass = 'status-overweight';
                const loseAmount = (weight - maxHealthyWeight).toFixed(1);
                goalMessage = `Aim to burn ~${loseAmount} kg. specific **HIIT Cardio** combined with strength training will ignite your metabolism.`;
                motivationMessage = "💧 **Sweat it Out!** Sweat is just fat crying. Every rep brings you closer to your goals. Stay consistent and let the gym be your transformation zone!";
            } else {
                category = 'Obese';
                statusClass = 'status-obese';
                const loseAmount = (weight - maxHealthyWeight).toFixed(1);
                goalMessage = `To reclaim your health, aim to lose ~${loseAmount} kg. Start with steady cardio and lighter weights to build momentum.`;
                motivationMessage = "🚀 **Reclaim Your Life!** You are stronger than you think. This journey is about resilience. One workout at a time, you WILL get there. We support you!";
            }

            // Update Content
            bmiStatus.textContent = category;
            bmiStatusBadge.classList.add(statusClass);
            bmiGoalText.innerHTML = goalMessage; // Changed to innerHTML to support bold tags
            bmiMotivationText.innerHTML = motivationMessage; // Changed to innerHTML to support bold tags
        }
    });

    // Recalculate Button Logic
    if (recalculateBtn) {
        recalculateBtn.addEventListener('click', function () {
            bmiResultCard.style.display = 'none';
            bmiDefaultInfo.style.display = 'block';
            bmiForm.reset();
        });
    }
}

// ===== CONSOLE MESSAGE =====
console.log('%c🏋️ Welcome to Narrow Fitness GYM! 💪', 'color: #a78bfa; font-size: 20px; font-weight: bold;');
console.log('%cTransform Your Body, Transform Your Life', 'color: #7c3aed; font-size: 14px;');


// ===== USER AUTHENTICATION & PROGRESS SYSTEM V2 =====
const authContainer = document.getElementById('auth-container');
const loginFormBox = document.getElementById('login-form-box');
const signupFormBox = document.getElementById('signup-form-box');
const userDashboard = document.getElementById('user-dashboard');
const welcomeMsg = document.getElementById('welcomeMsg');

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignupBtn = document.getElementById('showSignup');
const showLoginBtn = document.getElementById('showLogin');
const logoutBtn = document.getElementById('logoutBtn');

// Tracker Elements
const trackerForm = document.getElementById('trackerForm');
const trackerDate = document.getElementById('trackerDate');
const trackerType = document.getElementById('trackerType');
const trackerValue = document.getElementById('trackerValue');
const clearDataBtn = document.getElementById('clearDataBtn');
const ctx = document.getElementById('progressChart');

// New Feature Elements
const streakCountEl = document.getElementById('streakCount');
const badgeCountEl = document.getElementById('badgeCount');
const currentDayDisplay = document.getElementById('currentDayDisplay');
const dailyPlanContent = document.getElementById('dailyPlanContent');
const badgesGrid = document.getElementById('badgesGrid');
const scheduleTabs = document.getElementById('scheduleTabs');
const scheduleList = document.getElementById('scheduleList');

let chartInstance = null;
let currentUser = JSON.parse(sessionStorage.getItem('gymUser')) || null;
let progressData = [];
let userBookings = [];
let attendanceData = [];

// === DATA DEFINITIONS ===
const dailyPlans = [
    { day: "Sunday", focus: "Rest & Active Recovery 🧘", tasks: ["Light Stretching (15m)", "Meal Prep for Week", "Walk 5k steps"] },
    { day: "Monday", focus: "Push Day (Chest/Tri/Shoulders) 💥", tasks: ["Bench Press 5x5", "Overhead Press 3x10", "Incline Dumbbell Press 3x12"] },
    { day: "Tuesday", focus: "Pull Day (Back/Bi) 🦍", tasks: ["Deadlifts 3x5", "Pull Ups 3xFailure", "Barbell Rows 4x10"] },
    { day: "Wednesday", focus: "Leg Day (Quads/Calves) 🦵", tasks: ["Squats 5x5", "Leg Press 4x12", "Calf Raises 4x20"] },
    { day: "Thursday", focus: "Cardio & Abs 🏃", tasks: ["HIIT Treadmill (20m)", "Planks 3x1min", "Russian Twists 3x20"] },
    { day: "Friday", focus: "Full Body Compound 🏋️", tasks: ["Clean & Press 5x3", "Front Squats 3x10", "Dips 3xFailure"] },
    { day: "Saturday", focus: "Active Fun / Sports 🏀", tasks: ["Play a Sport", "Hiking", "Swimming"] }
];

const badgeDefinitions = [
    { id: 'start', icon: '🌱', name: 'Fresh Start', desc: 'Log your first entry', check: (d) => d.length >= 1 },
    { id: 'dedicated', icon: '🔥', name: 'Dedicated', desc: '3 Day Streak', check: (d) => calculateStreak(d) >= 3 },
    { id: 'pro', icon: '⚡', name: 'Consitent', desc: '10 Total Entries', check: (d) => d.length >= 10 },
    { id: 'heavy', icon: '🦍', name: 'Heavy Lifter', desc: 'Lift 100kg+', check: (d) => d.some(x => x.value >= 100) },
    { id: 'elite', icon: '👑', name: 'Elite Club', desc: 'Lift 140kg+', check: (d) => d.some(x => x.value >= 140) },
    { id: 'veteran', icon: '🛡️', name: 'Veteran', desc: '30 Total Entries', check: (d) => d.length >= 30 }
];

const classSchedule = {
    "Mon": [{ name: "Sunrise Yoga", time: "06:00 AM" }, { name: "Power Pump", time: "05:00 PM" }, { name: "Zumba", time: "07:00 PM" }],
    "Tue": [{ name: "HIIT Cardio", time: "06:30 AM" }, { name: "CrossFit", time: "05:30 PM" }, { name: "Spinning", time: "07:30 PM" }],
    "Wed": [{ name: "Pilates", time: "07:00 AM" }, { name: "Boxing", time: "06:00 PM" }, { name: "Yoga Flow", time: "08:00 PM" }],
    "Thu": [{ name: "Strength 101", time: "06:00 AM" }, { name: "Bootcamp", time: "05:00 PM" }, { name: "Abs Blast", time: "07:00 PM" }],
    "Fri": [{ name: "Morning Run", time: "05:30 AM" }, { name: "Body Combat", time: "06:00 PM" }, { name: "Meditation", time: "08:30 PM" }],
    "Sat": [{ name: "Weekend Warrior", time: "08:00 AM" }, { name: "Open Gym", time: "10:00 AM" }],
    "Sun": [{ name: "Restorative Yoga", time: "09:00 AM" }]
};

// === INITIALIZATION ===

if (currentUser) {
    showDashboard(currentUser);
} else {
    showAuth();
}

// === AUTH EVENT LISTENERS ===

if (showSignupBtn) showSignupBtn.addEventListener('click', (e) => { e.preventDefault(); toggleAuth('signup'); });
if (showLoginBtn) showLoginBtn.addEventListener('click', (e) => { e.preventDefault(); toggleAuth('login'); });

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value.trim();

        if (USE_API) {
            fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.user) loginUser(data.user);
                    else alert(data.error);
                })
                .catch(() => alert('Server connection failed. Run "node server.js"'));
        } else {
            const users = JSON.parse(localStorage.getItem('gymUsers')) || {};
            if (users[email] && users[email].password === password) {
                loginUser(users[email]);
            } else {
                alert('Invalid email or password!');
            }
        }
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim().toLowerCase();
        const password = document.getElementById('signupPassword').value.trim();
        if (USE_API) {
            fetch(`${API_BASE}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        alert('Account created! Logging in...');
                        loginUser(data.user);
                    } else {
                        alert(data.error);
                    }
                })
                .catch(() => alert('Server connection failed. Run "node server.js"'));
        } else {
            const users = JSON.parse(localStorage.getItem('gymUsers')) || {};
            if (users[email]) {
                alert('User already exists!');
                return;
            }
            const newUser = { name, email, password };
            users[email] = newUser;
            localStorage.setItem('gymUsers', JSON.stringify(users));
            loginUser(newUser);
            alert('Welcome to the Narrow Fitness family! 🚀');
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('gymUser');
        currentUser = null;
        userBookings = [];
        progressData = [];
        attendanceData = []; // Clear attendance
        showAuth();
    });
}

// === CORE AUTH FUNCTIONS ===

function loginUser(user) {
    currentUser = user;
    sessionStorage.setItem('gymUser', JSON.stringify(currentUser));
    showDashboard(currentUser);
    if (loginForm) loginForm.reset();
    if (signupForm) signupForm.reset();
}

function toggleAuth(mode) {
    if (mode === 'signup') {
        loginFormBox.style.display = 'none';
        signupFormBox.style.display = 'block';
    } else {
        signupFormBox.style.display = 'none';
        loginFormBox.style.display = 'block';
    }
}

function showAuth() {
    userDashboard.style.display = 'none';
    authContainer.style.display = 'flex';
    toggleAuth('login');
}

function showDashboard(user) {
    authContainer.style.display = 'none';
    userDashboard.style.display = 'grid'; // Maintain grid layout
    welcomeMsg.textContent = `Welcome, ${user.name} 👋`;

    loadUserData(user.email);
    updateDashboardUI();

    // Init Chart
    if (!chartInstance) initChart();
    else updateChart();
}

// === DATA MANAGEMENT ===

function loadUserData(email) {
    if (USE_API) {
        fetch(`${API_BASE}/data/${email}`)
            .then(res => res.json())
            .then(data => {
                progressData = data.progress || [];
                userBookings = data.bookings || [];
                attendanceData = data.attendance || [];
                if (trackerDate) trackerDate.valueAsDate = new Date();
                updateDashboardUI();
            })
            .catch(e => {
                console.error("API Error:", e);
                // Fallback or empty
                progressData = []; userBookings = []; attendanceData = [];
                updateDashboardUI();
            });
    } else {
        try {
            progressData = JSON.parse(localStorage.getItem(`gymData_${email}`)) || [];
            userBookings = JSON.parse(localStorage.getItem(`gymBookings_${email}`)) || [];
            attendanceData = JSON.parse(localStorage.getItem(`gymAttendance_${email}`)) || [];
            if (trackerDate) trackerDate.valueAsDate = new Date();
        } catch (e) {
            console.error("Error loading user data:", e);
            progressData = []; userBookings = []; attendanceData = [];
        }
    }
}

function saveUserData() {
    if (!currentUser) return;
    if (USE_API) {
        fetch(`${API_BASE}/data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUser.email, type: 'progress', data: progressData })
        }).catch(e => console.error("Save Error:", e));
    } else {
        localStorage.setItem(`gymData_${currentUser.email}`, JSON.stringify(progressData));
    }
}

function saveBookings() {
    if (!currentUser) return;
    if (USE_API) {
        fetch(`${API_BASE}/data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUser.email, type: 'bookings', data: userBookings })
        }).catch(e => console.error("Save Error:", e));
    } else {
        localStorage.setItem(`gymBookings_${currentUser.email}`, JSON.stringify(userBookings));
    }
}

// === DASHBOARD LOGIC ===

function updateDashboardUI() {
    updateDailyPlan();
    updateBadges();
    updateStreak();
    renderSchedule();
    updateAttendanceUI();
    updateAttendanceUI();
    updatePRs(); // Update new PR card
    updateChart(); // Render chart on load

    // Auto-select current day in schedule tabs
    const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const tab = document.querySelector(`.tab-btn[data-day="${todayShort}"]`);
    if (tab) tab.click();
    else {
        const firstTab = document.querySelector('.tab-btn');
        if (firstTab) firstTab.click();
    }
}

// === PR UPDATER ===
function updatePRs() {
    if (typeof progressData === 'undefined') return;

    const types = ['bench', 'squat', 'deadlift'];
    const prElements = {
        bench: document.getElementById('prBench'),
        squat: document.getElementById('prSquat'),
        deadlift: document.getElementById('prDeadlift')
    };

    types.forEach(type => {
        const entries = progressData.filter(p => p.type === type);
        if (entries.length > 0) {
            const maxVal = Math.max(...entries.map(e => e.value));
            if (prElements[type]) prElements[type].textContent = `${maxVal} kg`;
        } else {
            if (prElements[type]) prElements[type].textContent = '-- kg';
        }
    });
}

function updateDailyPlan() {
    if (!dailyPlanContent) return;
    const dayIndex = new Date().getDay(); // 0 = Sunday
    const plan = dailyPlans[dayIndex];
    if (currentDayDisplay) currentDayDisplay.textContent = plan.day;

    let html = `<h4>💪 ${plan.focus}</h4><ul>`;
    plan.tasks.forEach(task => html += `<li>${task}</li>`);
    html += `</ul>`;
    dailyPlanContent.innerHTML = html;
}

function updateStreak() {
    const streak = calculateStreak(progressData);
    if (streakCountEl) streakCountEl.textContent = `${streak} Day${streak !== 1 ? 's' : ''}`;
}

function calculateStreak(data) {
    if (!data.length) return 0;
    // Get unique dates sorted descending
    const uniqueDates = [...new Set(data.map(d => d.date))].sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentCheck = uniqueDates[0] === today ? 0 : (uniqueDates[0] === yesterday ? 0 : -1);

    if (currentCheck === -1) return 0; // Streak broken

    // Simple verification (naive implementation)
    // Actually, improved logic:
    let lastDate = new Date(today);
    // Check if we logged today
    let hasToday = uniqueDates.includes(today);

    // If we didn't log today, check yesterday. If neither, streak is 0.
    if (!hasToday && !uniqueDates.includes(yesterday)) return 0;

    // Start counting
    let count = 0;
    let checkDate = new Date(); // Start from today
    // If no entry today, start check from yesterday
    if (!hasToday) checkDate.setDate(checkDate.getDate() - 1);

    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (uniqueDates.includes(dateStr)) {
            count++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    return count;
}

function updateBadges() {
    if (!badgesGrid) return;
    badgesGrid.innerHTML = '';
    let unlockedCount = 0;

    badgeDefinitions.forEach(badge => {
        const isUnlocked = badge.check(progressData);
        if (isUnlocked) unlockedCount++;

        const badgeEl = document.createElement('div');
        badgeEl.className = `badge-item ${isUnlocked ? 'unlocked' : ''}`;
        badgeEl.innerHTML = `
            <span class="badge-icon" title="${badge.desc}">${badge.icon}</span>
            <span class="badge-name">${badge.name}</span>
        `;
        badgesGrid.appendChild(badgeEl);
    });

    if (badgeCountEl) badgeCountEl.textContent = `${unlockedCount}/${badgeDefinitions.length}`;
}

// === SCHEDULE FUNCTIONS ===
if (scheduleTabs) {
    scheduleTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            // Remove active from all
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            // Add active to clicked
            e.target.classList.add('active');
            // Render
            renderSchedule(e.target.dataset.day);
        }
    });
}

function renderSchedule(day) {
    if (!scheduleList) return;
    const classesForDay = classSchedule[day] || [];

    scheduleList.innerHTML = '';

    if (classesForDay.length === 0) {
        scheduleList.innerHTML = '<p style="color:var(--text-gray); text-align:center; padding:20px;">No classes today. Rest up!</p>';
        return;
    }

    classesForDay.forEach(cls => {
        const isBooked = userBookings.some(b => b.day === day && b.name === cls.name);

        const item = document.createElement('div');
        item.className = 'class-item';
        item.innerHTML = `
            <div class="class-info">
                <h4>${cls.name}</h4>
                <p>⏰ ${cls.time}</p>
            </div>
            <button class="btn-book ${isBooked ? 'booked' : ''}" onclick="toggleBooking('${day}', '${cls.name}')">
                ${isBooked ? 'Booked ✅' : 'Book Now'}
            </button>
        `;
        scheduleList.appendChild(item);
    });
}

// Global scope required for onclick
window.toggleBooking = function (day, className) {
    if (!currentUser) return;

    const index = userBookings.findIndex(b => b.day === day && b.name === className);
    if (index === -1) {
        userBookings.push({ day, name: className });
        alert(`Booked ${className} for ${day}!`);
    } else {
        userBookings.splice(index, 1);
    }

    saveBookings();
    renderSchedule(day); // Re-render to update button
};

// === CHART & TRACKER LOGIC (Previous) ===
// (Kept largely the same but integrated with new updates)

function initChart() {
    if (!ctx) return;
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Progress', data: [], borderColor: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, 0.2)', fill: true, tension: 0.4 }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#cbd5e1' } } },
            scales: { x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.05)' } } }
        }
    });
    updateChart();
}

function updateChart() {
    if (!chartInstance || !trackerType) return;
    const currentMetric = trackerType.value;
    const filteredData = progressData.filter(item => item.type === currentMetric);
    // Update labels/datasets...
    chartInstance.data.labels = filteredData.map(item => item.date);
    chartInstance.data.datasets[0].data = filteredData.map(item => item.value);
    chartInstance.data.datasets[0].label = trackerType.options[trackerType.selectedIndex].text;
    chartInstance.update();
}

if (trackerForm) {
    trackerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const newEntry = {
            id: Date.now(),
            date: trackerDate.value,
            type: trackerType.value,
            value: parseFloat(trackerValue.value)
        };

        progressData.push(newEntry);
        progressData.sort((a, b) => new Date(a.date) - new Date(b.date));

        saveUserData();
        updateChart();
        updateDashboardUI(); // Updates streak and badges!

        const btn = trackerForm.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = 'Saved! ✅';
        setTimeout(() => btn.textContent = originalText, 1500);
    });
}

if (trackerType) trackerType.addEventListener('change', updateChart);
if (clearDataBtn) {
    // Apply small button styles dynamically
    clearDataBtn.className = 'btn-sm btn-danger-soft';
    clearDataBtn.style.flex = '1';
    clearDataBtn.style.justifyContent = 'center';
    clearDataBtn.innerHTML = 'Clear History 🗑️';

    clearDataBtn.addEventListener('click', () => {
        if (confirm('Delete all history?')) {
            progressData = [];
            saveUserData();
            updateChart();
            updateDashboardUI();
        }


    });
}





// Export PDF Report
const exportBtn = document.getElementById('exportBtn');
if (exportBtn) {
    // Apply small button styles dynamically
    exportBtn.className = 'btn-sm btn-primary-soft';
    exportBtn.style.flex = '1';
    exportBtn.style.justifyContent = 'center';
    exportBtn.innerHTML = 'Download Report 📥';
    exportBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (!progressData || progressData.length === 0) {
            alert('No data to report! Log some workouts first. 💪');
            return;
        }

        if (!window.jspdf) {
            alert('PDF Library not loaded. Please check your internet connection and refresh.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Brand Colors
        const primaryColor = [124, 58, 237]; // #7c3aed (Purple)
        const lightPurple = [245, 243, 255]; // Light bg
        const darkText = [26, 26, 46];

        // 1. Header (Letterhead)
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 40, 'F'); // Top bar

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('NARROW FITNESS', 14, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('MEMBER PROGRESS REPORT', 14, 32);

        doc.setFontSize(10);
        doc.text(new Date().toLocaleDateString(), 196, 25, { align: 'right' });

        // 2. User Info
        doc.setTextColor(...darkText);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Member Profile`, 14, 55);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Name: ${currentUser ? currentUser.name : 'Guest User'}`, 14, 62);
        doc.text(`Email: ${currentUser ? currentUser.email : 'Not Registered'}`, 14, 68);

        // 3. Stats Summary Box
        const streak = typeof calculateStreak === 'function' ? calculateStreak(progressData) : 0;
        const totalEntries = progressData.length;
        const personalBest = Math.max(...progressData.map(d => d.value), 0);

        // Draw Summary Box Background
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(...lightPurple);
        doc.roundedRect(14, 80, 182, 25, 2, 2, 'FD');

        // Stats Labels & Values
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('CURRENT STREAK', 25, 88);
        doc.text('TOTAL ENTRIES', 90, 88);
        doc.text('PERSONAL BEST', 155, 88);

        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text(`${streak} Days`, 25, 98);
        doc.text(`${totalEntries}`, 90, 98);
        doc.text(`${personalBest} kg`, 155, 98);

        // 4. Data Table
        const tableBody = progressData.map(entry => [
            entry.date,
            entry.type.toUpperCase(),
            entry.value + ' kg'
        ]);

        doc.autoTable({
            startY: 115,
            head: [['Date', 'Metric / Exercise', 'Value recorded']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
            styles: { font: 'helvetica', fontSize: 10, cellPadding: 4 },
            alternateRowStyles: { fillColor: [249, 250, 255] }
        });

        // 5. Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('Train Hard. Stay Consistent. | Generated via Member Portal', 14, 285);
            doc.text(`Page ${i} of ${pageCount}`, 196, 285, { align: 'right' });
        }

        // Save PDF
        doc.save(`NarrowFitness_Report_${currentUser ? currentUser.name.replace(/\s+/g, '_') : 'Guest'}.pdf`);
    });
}

// === ATTENDANCE SYSTEM ===
const checkInBtn = document.getElementById('checkInBtn');
const checkInStatus = document.getElementById('checkInStatus');
const visitList = document.getElementById('visitList');

function updateAttendanceUI() {
    if (!attendanceData || !checkInBtn) return;

    // Check if already checked in today
    const now = new Date();
    const todayStr = now.toLocaleDateString();

    let isCheckedIn = false;
    if (attendanceData.length > 0) {
        // Attendance uses ISO strings. Convert to date object
        const lastEntry = attendanceData[attendanceData.length - 1];
        const lastDate = new Date(lastEntry).toLocaleDateString();
        if (lastDate === todayStr) isCheckedIn = true;
    }

    if (isCheckedIn) {
        checkInBtn.innerHTML = 'Checked In ✅';
        checkInBtn.disabled = true;
        checkInBtn.style.opacity = '0.6';
        checkInStatus.textContent = 'You are checked in for today!';
        checkInStatus.style.color = '#10b981'; // Green
    } else {
        checkInBtn.innerHTML = 'Check In Now 📍';
        checkInBtn.disabled = false;
        checkInBtn.style.opacity = '1';
        checkInStatus.textContent = 'Not checked in today.';
        checkInStatus.style.color = '#cbd5e1';
    }

    // Render History (Last 5)
    if (visitList) {
        visitList.innerHTML = '';
        // Create copy, reverse, take 5
        const recent = [...attendanceData].reverse().slice(0, 5);

        if (recent.length === 0) {
            visitList.innerHTML = '<li style="padding:10px; text-align:center; color: var(--text-gray);">No visits yet. Start today!</li>';
        } else {
            recent.forEach(timestamp => {
                const date = new Date(timestamp);
                const dateStr = date.toLocaleDateString();
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const li = document.createElement('li');
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.padding = '8px 0';
                li.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
                li.innerHTML = `<span style="color:#fff;">${dateStr}</span> <span style="color:#a78bfa;">@ ${timeStr}</span>`;
                visitList.appendChild(li);
            });
        }
    }
}

if (checkInBtn) {
    checkInBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const now = new Date();
        attendanceData.push(now.toISOString());

        if (USE_API) {
            fetch(`${API_BASE}/data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser.email, type: 'attendance', data: attendanceData })
            }).catch(e => console.error("Save Attendance Error:", e));
        } else {
            localStorage.setItem(`gymAttendance_${currentUser.email}`, JSON.stringify(attendanceData));
        }

        updateAttendanceUI();

        // Visual Feedback
        // Visual Feedback (Milestone Animation)
        showMilestone('Welcome to Narrow Fitness!', 'Have a great workout! 💪', '🎉');
    });
}

// Download Attendance PDF
const downloadAttendanceBtn = document.getElementById('downloadAttendanceBtn');
if (downloadAttendanceBtn) {
    downloadAttendanceBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (!attendanceData || attendanceData.length === 0) {
            alert('No attendance history found! Check in first. 📍');
            return;
        }

        if (!window.jspdf) {
            alert('PDF Library not loaded. Please try again.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const primaryColor = [124, 58, 237]; // Purple

        // Header
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('GYM ATTENDANCE LOG', 14, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(new Date().toLocaleDateString(), 196, 25, { align: 'right' });

        // User Info
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(12);
        doc.text(`Member: ${currentUser ? currentUser.name : 'Guest'}`, 14, 50);
        doc.text(`Total Visits: ${attendanceData.length}`, 14, 58);

        // Table
        const rows = attendanceData.map(ts => {
            const d = new Date(ts);
            return [d.toLocaleDateString(), d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })];
        });

        doc.autoTable({
            startY: 70,
            head: [['Date of Visit', 'Check-In Time']],
            body: rows,
            theme: 'striped',
            headStyles: { fillColor: primaryColor, textColor: 255 },
            styles: { fontSize: 10, cellPadding: 4 }
        });

        doc.save(`Attendance_Log_${currentUser ? currentUser.name.replace(/\s+/g, '_') : 'User'}.pdf`);
    });

}

// === MILESTONE ANIMATION FUNCTION ===
function showMilestone(title, message, icon) {
    // Create element
    const popup = document.createElement('div');
    popup.className = 'milestone-popup';
    popup.innerHTML = `
        <div class="milestone-content">
            <span class="milestone-icon">${icon}</span>
            <h2>${title}</h2>
            <p>${message}</p>
        </div>
    `;

    document.body.appendChild(popup);

    // Trigger animation (next frame)
    requestAnimationFrame(() => {
        popup.classList.add('active');
    });

    // Remove after 3 seconds with disappear animation
    setTimeout(() => {
        popup.classList.remove('active');
        popup.classList.add('disappear');
        // Wait for css transition to finish
        setTimeout(() => {
            if (popup.parentNode) popup.parentNode.removeChild(popup);
        }, 500);
    }, 3000);
}
