
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ===== FIREBASE CONFIGURATION =====
const firebaseConfig = {
    apiKey: "AIzaSyA3BJWAI7XjEQcK4WgO7IoVVE5Q9esMpXw",
    authDomain: "narrow-fitness.firebaseapp.com",
    projectId: "narrow-fitness",
    storageBucket: "narrow-fitness.firebasestorage.app",
    messagingSenderId: "265336849443",
    appId: "1:265336849443:web:7cd4ea872c3a25f23f9d96",
    measurementId: "G-FF9M3PZTJJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Firebase Initialized");

// ===== UI ELEMENTS =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

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
const trackerValue = document.getElementById('trackerValue');
const clearDataBtn = document.getElementById('clearDataBtn');
const ctx = document.getElementById('progressChart');

// Dashboard Utils
const streakCountEl = document.getElementById('streakCount');
const badgeCountEl = document.getElementById('badgeCount');
const currentDayDisplay = document.getElementById('currentDayDisplay');
const dailyPlanContent = document.getElementById('dailyPlanContent');
const badgesGrid = document.getElementById('badgesGrid');
const scheduleTabs = document.getElementById('scheduleTabs');
const scheduleList = document.getElementById('scheduleList');

let chartInstance = null;
let currentUser = null; // Holds the Firebase User object
let progressData = [];
let userBookings = [];
let attendanceData = [];

// ===== NAVIGATION & UI LOGIC =====

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
});

// Mobile menu
if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Auth Toggle
if (showSignupBtn) showSignupBtn.addEventListener('click', (e) => { e.preventDefault(); toggleAuth('signup'); });
if (showLoginBtn) showLoginBtn.addEventListener('click', (e) => { e.preventDefault(); toggleAuth('login'); });

function toggleAuth(mode) {
    if (mode === 'signup') {
        loginFormBox.style.display = 'none';
        signupFormBox.style.display = 'block';
    } else {
        signupFormBox.style.display = 'none';
        loginFormBox.style.display = 'block';
    }
}

// ===== FIREBASE AUTHENTICATION LOGIC =====

// 1. Listen for Auth State Changes (Login/Logout/Page Refresh)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log("User detected:", user.email);
        currentUser = user;
        showDashboard(user);
    } else {
        // User is signed out
        console.log("No user signed in");
        currentUser = null;
        showAuth();
    }
});

// 2. Login Function
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will handle the UI update
        } catch (error) {
            console.error("Login Error:", error);
            alert("Login Failed: " + error.message);
        }
    });
}

// 3. Signup Function
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value.trim();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user document in Firestore with initial data
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                createdAt: new Date(),
                progress: [],
                attendance: [],
                bookings: []
            });

            alert("Account created successfully! Welcome to Narrow Fitness.");
            // onAuthStateChanged will redirect
        } catch (error) {
            console.error("Signup Error:", error);
            alert("Signup Failed: " + error.message);
        }
    });
}

// 4. Logout Function
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            // onAuthStateChanged will handle the UI
        } catch (error) {
            console.error("Logout Error:", error);
        }
    });
}

// ===== DASHBOARD & DATA LOGIC =====

function showAuth() {
    userDashboard.style.display = 'none';
    authContainer.style.display = 'flex';
    toggleAuth('login');
}

async function showDashboard(user) {
    authContainer.style.display = 'none';
    userDashboard.style.display = 'grid'; // Maintain grid layout

    // Fetch Name
    try {
        await loadUserData(user.uid);
    } catch (e) {
        console.error("Error loading profile:", e);
    }
}

// Load Data from Firestore
async function loadUserData(uid) {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        welcomeMsg.textContent = `Welcome, ${data.name || 'Athlete'} 👋`;
        progressData = data.progress || [];
        attendanceData = data.attendance || [];
        userBookings = data.bookings || [];

        // Set date input to today
        if (trackerDate) trackerDate.valueAsDate = new Date();

        updateDashboardUI();
        if (!chartInstance) initChart();
        else updateChart();
    } else {
        console.log("No such document!");
    }
}

// Save Track Data
if (trackerForm) {
    trackerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const entry = {
            date: trackerDate.value,
            type: document.getElementById('trackerType').value,
            value: parseFloat(trackerValue.value)
        };

        progressData.push(entry);

        // Update Firestore
        try {
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                progress: progressData
            });
            updateDashboardUI();
            updateChart();
            alert("Entry Saved! 📈");
        } catch (e) {
            console.error("Error saving entry:", e);
            alert("Error saving data: " + e.message);
        }
    });
}

// Check In
const checkInBtn = document.getElementById('checkInBtn');
if (checkInBtn) {
    checkInBtn.addEventListener('click', async () => {
        if (!currentUser) return;
        const today = new Date().toISOString().split('T')[0];

        if (!attendanceData.includes(today)) {
            attendanceData.push(today);

            // Save to Firestore
            try {
                const userRef = doc(db, "users", currentUser.uid);
                await updateDoc(userRef, {
                    attendance: arrayUnion(today)
                });
                updateDashboardUI();
                alert("Checked In! 💪");
            } catch (e) {
                console.error("Error checking in:", e);
            }
        } else {
            alert("You already checked in today!");
        }
    });
}

// ===== DASHBOARD UI UPDATES =====

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
    { id: 'pro', icon: '⚡', name: 'Consistent', desc: '10 Total Entries', check: (d) => d.length >= 10 },
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


function updateDashboardUI() {
    updateDailyPlan();
    updateBadges();
    updateStreak();
    renderSchedule();
    updateCheckInStatus();
    updatePRs();
    renderVisitList();
}

function updateDailyPlan() {
    const today = new Date().getDay(); // 0 = Sunday
    const plan = dailyPlans[today];

    currentDayDisplay.textContent = plan.day;

    let html = `<h4>Focus: ${plan.focus}</h4><ul>`;
    plan.tasks.forEach(task => {
        html += `<li><input type="checkbox"> ${task}</li>`;
    });
    html += `</ul>`;

    dailyPlanContent.innerHTML = html;
}

function updateBadges() {
    badgesGrid.innerHTML = '';
    let earnedCount = 0;

    badgeDefinitions.forEach(badge => {
        const isEarned = badge.check(progressData);
        if (isEarned) earnedCount++;

        const badgeEl = document.createElement('div');
        badgeEl.className = `badge-item ${isEarned ? 'earned' : 'locked'}`;
        badgeEl.innerHTML = `
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-name">${badge.name}</div>
        `;
        badgeEl.title = badge.desc;
        badgesGrid.appendChild(badgeEl);
    });

    badgeCountEl.textContent = `${earnedCount}/${badgeDefinitions.length}`;
}

function calculateStreak(data) {
    // Basic streak calculation logic based on dates in progressData or attendanceData
    if (attendanceData.length === 0) return 0;

    const sortedDates = [...new Set(attendanceData)].sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    let current = new Date();

    // Check if checked in today
    const todayStr = current.toISOString().split('T')[0];
    if (sortedDates[0] === todayStr) {
        streak = 1;
        current.setDate(current.getDate() - 1);
    }

    // Look back
    for (let i = 0; i < sortedDates.length; i++) {
        const dateStr = sortedDates[i];
        if (dateStr === todayStr && i === 0) continue; // Already counted

        const compareStr = current.toISOString().split('T')[0];

        if (dateStr === compareStr) {
            streak++;
            current.setDate(current.getDate() - 1);
        } else {
            // Basic gap check - ideally would fill gaps
            break;
        }
    }
    return streak;
}

function updateStreak() {
    const streak = calculateStreak(attendanceData);
    streakCountEl.textContent = `${streak} Days`;
}

function updateCheckInStatus() {
    const today = new Date().toISOString().split('T')[0];
    const statusEl = document.getElementById('checkInStatus');
    if (attendanceData.includes(today)) {
        statusEl.textContent = "✅ Checked in today!";
        statusEl.style.color = "#4ecca3";
    } else {
        statusEl.textContent = "Not checked in today.";
        statusEl.style.color = "var(--text-gray)";
    }
}

function renderVisitList() {
    const list = document.getElementById('visitList');
    if (!list) return;
    list.innerHTML = '';

    // Show last 5 visits
    const recent = [...attendanceData].reverse().slice(0, 5);
    recent.forEach(date => {
        const li = document.createElement('li');
        li.textContent = `📍 ${new Date(date).toDateString()}`;
        list.appendChild(li);
    });
}

function updatePRs() {
    const types = ['bench', 'squat', 'deadlift'];

    types.forEach(type => {
        const entries = progressData.filter(e => e.type === type);
        let max = 0;
        if (entries.length > 0) {
            max = Math.max(...entries.map(e => e.value));
        }

        const el = document.getElementById(`pr${type.charAt(0).toUpperCase() + type.slice(1)}`);
        if (el) el.textContent = max > 0 ? `${max} kg` : '-- kg';
    });
}

function renderSchedule() {
    // Add logic to switch tabs
    const buttons = scheduleTabs.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showScheduleForDay(btn.dataset.day);
        });
    });

    // Default to Today (or Mon)
    const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const todayShort = daysMap[new Date().getDay()];

    // Determine active tab
    buttons.forEach(b => {
        if (b.dataset.day === todayShort) {
            b.click();
        }
    });
}

function showScheduleForDay(day) {
    const classes = classSchedule[day] || [];
    scheduleList.innerHTML = '';

    if (classes.length === 0) {
        scheduleList.innerHTML = '<p style="color:var(--text-gray); font-style:italic;">No classes scheduled.</p>';
        return;
    }

    classes.forEach(cls => {
        const item = document.createElement('div');
        item.className = 'schedule-item';
        item.innerHTML = `
            <div class="class-time">${cls.time}</div>
            <div class="class-name">${cls.name}</div>
            <button class="btn-sm btn-outline">Book</button>
        `;
        scheduleList.appendChild(item);
    });
}

// ===== CHART JS =====
function initChart() {
    if (!ctx) return;

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Weight (kg)',
                data: [],
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#e2e8f0' } }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
    updateChart();
}

function updateChart() {
    if (!chartInstance) return;

    // Sort data by date
    const sorted = [...progressData]
        .filter(e => e.type === 'weight') // Default view
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    chartInstance.data.labels = sorted.map(e => e.date);
    chartInstance.data.datasets[0].data = sorted.map(e => e.value);
    chartInstance.update();
}

// ===== SLIDER FUNCTIONALITY =====
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
let slideInterval;

function showSlide(index) {
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function changeSlide(direction) {
    showSlide(currentSlide + direction);
    resetSlideInterval();
}
// Expose for HTML onclick
window.changeSlide = changeSlide;
window.currentSlide = (n) => { showSlide(n); resetSlideInterval(); };

function autoSlide() {
    slideInterval = setInterval(() => { showSlide(currentSlide + 1); }, 5000);
}

function resetSlideInterval() {
    clearInterval(slideInterval);
    autoSlide();
}

// Initialize Slider
if (slides.length > 0) {
    autoSlide();
    document.querySelector('.slider-container').addEventListener('mouseenter', () => clearInterval(slideInterval));
    document.querySelector('.slider-container').addEventListener('mouseleave', autoSlide);
}
