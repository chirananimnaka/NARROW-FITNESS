
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
let currentUserEmail = null; // Changed from Firebase User object to simple email string
let progressData = [];
let userBookings = [];
let attendanceData = [];

const API_URL = 'http://localhost:3000/api';

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

// ===== AUTHENTICATION LOGIC (LOCAL API) =====

// Check for existing session (simulate persistence)
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('narrowUser');
    if (savedUser) {
        currentUserEmail = savedUser;
        showDashboard(savedUser);
    } else {
        showAuth();
    }
});

// Login Function
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                currentUserEmail = data.user.email;
                localStorage.setItem('narrowUser', currentUserEmail);
                showDashboard(currentUserEmail);
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Login Failed: " + error.message);
        }
    });
}

// Signup Function
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value.trim();

        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Account created successfully! Please log in.");
                toggleAuth('login');
            } else {
                throw new Error(data.error || 'Signup failed');
            }
        } catch (error) {
            console.error("Signup Error:", error);
            alert("Signup Failed: " + error.message);
        }
    });
}

// Logout Function
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        currentUserEmail = null;
        localStorage.removeItem('narrowUser');
        showAuth();
    });
}

// ===== DASHBOARD & DATA LOGIC =====

function showAuth() {
    userDashboard.style.display = 'none';
    authContainer.style.display = 'flex';
    toggleAuth('login');
}

async function showDashboard(email) {
    authContainer.style.display = 'none';
    userDashboard.style.display = 'grid'; // Maintain grid layout

    // Fetch User Data
    try {
        await loadUserData(email);
    } catch (e) {
        console.error("Error loading profile:", e);
    }
}

// Load Data from Local API
async function loadUserData(email) {
    try {
        const response = await fetch(`${API_URL}/data/${email}`);
        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();

        // Use user email/name for welcome (API doesn't return name in /data/:email yet, so we default or need to update API)
        // Ideally we'd store name in localStorage too or fetch it. For now, use 'Athlete' or email.
        welcomeMsg.textContent = `Welcome, Athlete 👋`;

        progressData = data.progress || [];
        attendanceData = (data.attendance || []).map(d => {
            // Handle both full ISO strings and simple dates safely
            if (typeof d === 'string') return d.split('T')[0];
            return new Date(d).toISOString().split('T')[0];
        });
        userBookings = data.bookings || [];

        // Set date input to today
        if (trackerDate) trackerDate.valueAsDate = new Date();

        updateDashboardUI();
        if (!chartInstance) initChart();
        else updateChart();

    } catch (error) {
        console.error("Error loading user data", error);
    }
}

// Save Track Data
if (trackerForm) {
    trackerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUserEmail) return;

        const entry = {
            id: Date.now(),
            date: trackerDate.value,
            type: document.getElementById('trackerType').value,
            value: parseFloat(trackerValue.value)
        };

        progressData.push(entry);

        // Update via API
        try {
            const response = await fetch(`${API_URL}/data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: currentUserEmail,
                    type: 'progress',
                    data: progressData
                })
            });

            if (!response.ok) throw new Error('Failed to save');

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
        if (!currentUserEmail) return;
        const today = new Date().toISOString().split('T')[0];

        if (!attendanceData.includes(today)) {
            attendanceData.push(today);

            // Save via API
            try {
                const response = await fetch(`${API_URL}/data`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: currentUserEmail,
                        type: 'attendance',
                        data: attendanceData
                    })
                });

                if (!response.ok) throw new Error('Failed to check in');

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

// ===== DASHBOARD UI UPDATES (UNCHANGED) =====

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


// ===== NEW FUNCTIONALITY: BMI & REPORTS =====

// 1. BMI Calculator Logic
const bmiForm = document.getElementById('bmiForm');
if (bmiForm) {
    bmiForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const weight = parseFloat(document.getElementById('weight').value);
        const feet = parseFloat(document.getElementById('feet').value);
        const inches = parseFloat(document.getElementById('inches').value);

        if (!weight || (isNaN(feet) && feet !== 0) || (isNaN(inches) && inches !== 0)) return;

        // Convert Height to Meters
        // 1 foot = 0.3048 m, 1 inch = 0.0254 m
        const heightInMeters = (feet * 0.3048) + (inches * 0.0254);

        if (heightInMeters === 0) return;

        const bmi = weight / (heightInMeters * heightInMeters);
        const score = bmi.toFixed(1);

        // Update UI
        document.getElementById('bmiScore').textContent = score;
        const statusEl = document.getElementById('bmiStatus');
        const goalEl = document.getElementById('bmiGoalText');
        const badgeEl = document.getElementById('bmiStatusBadge');

        let status = '', color = '', goal = '';

        if (bmi < 18.5) {
            status = 'Underweight';
            color = '#3b82f6'; // Blue
            goal = 'Focus on nutrient-dense surplus to build mass.';
        } else if (bmi < 25) {
            status = 'Healthy';
            color = '#10b981'; // Green
            goal = 'Maintain your current activity and nutrition.';
        } else if (bmi < 30) {
            status = 'Overweight';
            color = '#f59e0b'; // Orange
            goal = 'Target a moderate calorie deficit and cardio.';
        } else {
            status = 'Obese';
            color = '#ef4444'; // Red
            goal = 'Consult a specialist and start low-impact cardio.';
        }

        statusEl.textContent = status;
        statusEl.style.color = '#fff';
        badgeEl.style.backgroundColor = color; // Ensure badge gets color
        goalEl.textContent = goal;

        // Switch Views
        document.getElementById('bmiDefaultInfo').style.display = 'none';
        const resultCard = document.getElementById('bmiResultCard');
        resultCard.style.display = 'block';
        resultCard.classList.add('fade-in-right');
    });
}

const recalculateBtn = document.getElementById('recalculateBtn');
if (recalculateBtn) {
    recalculateBtn.addEventListener('click', () => {
        document.getElementById('bmiResultCard').style.display = 'none';
        document.getElementById('bmiDefaultInfo').style.display = 'block';
        document.getElementById('bmiForm').reset();
    });
}

// 2. Download Report logic (using jsPDF)
const exportBtn = document.getElementById('exportBtn');
if (exportBtn) {
    exportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!window.jspdf) {
            alert('PDF Library not loaded');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(124, 58, 237); // Purple
        doc.text("Narrow Fitness", 10, 15);

        doc.setFontSize(16);
        doc.setTextColor(40);
        doc.text("Progress Report", 10, 25);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`User Email: ${currentUserEmail || 'Guest'}`, 10, 32);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 10, 37);

        // Data Table
        const tableData = progressData.map(p => [
            p.date,
            p.type.toUpperCase(),
            p.value + (p.type === 'weight' ? ' kg' : ' kg')
        ]);

        doc.autoTable({
            head: [['Date', 'Metric', 'Value']],
            body: tableData,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [124, 58, 237] }
        });

        doc.save('NarrowFitness_Progress.pdf');
    });
}

// 3. Download Attendance logic
const downloadAttendanceBtn = document.getElementById('downloadAttendanceBtn');
if (downloadAttendanceBtn) {
    downloadAttendanceBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!window.jspdf) {
            alert('PDF Library not loaded');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.setTextColor(124, 58, 237);
        doc.text("Narrow Fitness", 10, 15);

        doc.setFontSize(16);
        doc.setTextColor(40);
        doc.text("Attendance History", 10, 25);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`User Email: ${currentUserEmail || 'Guest'}`, 10, 32);

        // Format data
        // attendanceData might be strings or dates depending on my fix, ensure consistency
        const tableData = attendanceData.map(d => {
            const dateObj = new Date(d);
            return [
                dateObj.toLocaleDateString(),
                dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                'Checked In'
            ];
        });

        doc.autoTable({
            head: [['Date', 'Time (Approx)', 'Status']],
            body: tableData,
            startY: 40,
            theme: 'striped',
            headStyles: { fillColor: [78, 204, 163] } // Greenish
        });

        doc.save('NarrowFitness_Attendance.pdf');
    });
}

// Ensure DOM is fully loaded before attaching complex event listeners
document.addEventListener('DOMContentLoaded', () => {

    // 4. Clear History Logic
    const clearBtn = document.getElementById('clearDataBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
            if (!currentUserEmail) {
                alert("Please log in to perform this action.");
                return;
            }
            if (!confirm("Are you sure you want to clear ALL your tracking history? This cannot be undone.")) return;

            // Optimistic UI update
            const originalData = [...progressData];
            progressData = [];

            try {
                // Update via API - we send empty array
                const response = await fetch(`${API_URL}/data`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: currentUserEmail,
                        type: 'progress',
                        data: []
                    })
                });

                if (!response.ok) throw new Error('Failed to clear data');

                updateDashboardUI();
                updateChart();
                alert("History Cleared! 🗑️");
            } catch (e) {
                console.error("Error clearing data:", e);
                progressData = originalData; // Revert
                alert("Error clearing data: " + e.message);
                updateDashboardUI();
            }
        });
    } else {
        console.error("Clear Data Button not found in DOM");
    }

    // 4.5 Clear Attendance Logic (NEW)
    const clearAttendanceBtn = document.getElementById('clearAttendanceBtn');
    if (clearAttendanceBtn) {
        clearAttendanceBtn.addEventListener('click', async () => {
            if (!currentUserEmail) {
                alert("Please log in first.");
                return;
            }
            if (!confirm("Are you sure you want to clear ALL your ATTENDANCE history? This cannot be undone.")) return;

            // Optimistic Update
            const originalAttendance = [...attendanceData];
            attendanceData = [];

            try {
                const response = await fetch(`${API_URL}/data`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: currentUserEmail,
                        type: 'attendance',
                        data: []
                    })
                });

                if (!response.ok) throw new Error('Failed to clear attendance');

                updateDashboardUI(); // This will clear the list and reset streak
                renderVisitList();
                alert("Attendance History Cleared! 🗑️");
            } catch (e) {
                console.error("Error clearing attendance:", e);
                attendanceData = originalAttendance; // Revert
                alert("Error clearing attendance: " + e.message);
                updateDashboardUI();
            }
        });
    }

    // 5. Add Past Attendance Logic
    const addPastBtn = document.getElementById('addPastAttendanceBtn');
    const pastDateInput = document.getElementById('pastAttendanceDate');

    if (addPastBtn && pastDateInput) {
        addPastBtn.addEventListener('click', async () => {
            if (!currentUserEmail) {
                alert("Please log in first.");
                return;
            }

            const dateVal = pastDateInput.value;
            if (!dateVal) {
                alert("Please select a date first.");
                return;
            }

            if (attendanceData.includes(dateVal)) {
                alert("Attendance already recorded for this date.");
                return;
            }

            // Store original for revert
            const originalAttendance = [...attendanceData];

            attendanceData.push(dateVal);
            // Sort to keep history chronological
            attendanceData.sort((a, b) => new Date(a) - new Date(b));

            try {
                const response = await fetch(`${API_URL}/data`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: currentUserEmail,
                        type: 'attendance',
                        data: attendanceData
                    })
                });

                if (!response.ok) throw new Error('Failed to add past attendance');

                updateDashboardUI();
                // Explicitly re-render list if it exists
                if (typeof renderVisitList === 'function') {
                    renderVisitList();
                }
                alert(`Attendance added for ${dateVal}! ✅`);
                pastDateInput.value = ''; // Reset input
            } catch (e) {
                console.error("Error adding past attendance:", e);
                attendanceData = originalAttendance; // Revert
                alert("Error adding attendance: " + e.message);
                updateDashboardUI();
            }
        });
    }

    // 6. Creative PDF Logic
    const creativePdfBtn = document.getElementById('creativePdfBtn');

    if (creativePdfBtn) {
        creativePdfBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!currentUserEmail) {
                alert("Please log in first.");
                return;
            }
            if (!window.jspdf) {
                alert('PDF Library not loaded');
                return;
            }

            // 1. Prepare Data
            const weightEntries = progressData.filter(p => p.type === 'weight');
            const attendanceSet = new Set(attendanceData); // unique dates

            // Collect all unique dates from both sources
            const allDatesSet = new Set([
                ...attendanceData,
                ...weightEntries.map(e => e.date)
            ]);

            // Sort dates
            const sortedDates = Array.from(allDatesSet).sort((a, b) => new Date(a) - new Date(b));

            // Logic to fill forward weight
            let lastKnownWeight = 'N/A';
            const tableData = [];

            sortedDates.forEach(date => {
                // Check if we have a weight update for this specific date
                // There might be multiple updates on one day, take the last one or average? Let's take last.
                const daysWeightEntries = weightEntries.filter(e => e.date === date);
                if (daysWeightEntries.length > 0) {
                    // Start of day to end of day logic? Arrays are just simplified. 
                    // progressData is pushed, so last one is latest.
                    lastKnownWeight = daysWeightEntries[daysWeightEntries.length - 1].value;
                }

                const attended = attendanceSet.has(date);

                tableData.push([
                    new Date(date).toLocaleDateString(),
                    attended ? 'YES' : '-',
                    lastKnownWeight !== 'N/A' ? `${lastKnownWeight} kg` : '-'
                ]);
            });

            // 2. Generate PDF using jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // --- Custom Creative Design ---

            // Background Header
            doc.setFillColor(26, 26, 46); // Dark blue background
            doc.rect(0, 0, 210, 40, 'F');

            // Title
            doc.setFontSize(26);
            doc.setTextColor(255, 255, 255);
            doc.font = "helvetica";
            doc.setFont("helvetica", "bold");
            doc.text("NARROW FITNESS", 105, 20, { align: 'center' });

            doc.setFontSize(14);
            doc.setTextColor(167, 139, 250); // Light purple
            doc.text("ATTENDANCE & WEIGHT REPORT", 105, 30, { align: 'center' });

            // User Info
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Athlete: ${currentUserEmail}`, 14, 50);
            doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 55);

            // Motivational Quote
            doc.setFontSize(10);
            doc.setTextColor(124, 58, 237);
            doc.setFont("helvetica", "italic");
            doc.text('"Consistency is the key to breakthrough."', 196, 50, { align: 'right' });

            // Table
            doc.autoTable({
                head: [['Date', 'Gym Attendance', 'Body Weight']],
                body: tableData,
                startY: 65,
                theme: 'grid',
                styles: {
                    font: "helvetica",
                    fontSize: 10,
                    cellPadding: 5,
                    textColor: [40, 40, 40]
                },
                headStyles: {
                    fillColor: [16, 185, 129], // Green
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                columnStyles: {
                    0: { halign: 'left' },
                    1: { halign: 'center', fontStyle: 'bold' },
                    2: { halign: 'center' }
                },
                didParseCell: function (data) {
                    // Custom styling for specific cells
                    if (data.section === 'body') {
                        if (data.column.index === 1) { // Attendance Column
                            if (data.cell.raw === 'YES') {
                                data.cell.styles.textColor = [16, 185, 129]; // Green
                            } else {
                                data.cell.styles.textColor = [200, 200, 200]; // Light Gray
                            }
                        }
                        if (data.column.index === 2) { // Weight Column
                            // Highlight if weight changed? (Complex to track in this hook)
                            // Just ensure it looks clean
                        }
                    }
                },
                alternateRowStyles: {
                    fillColor: [240, 253, 244] // Very light green
                }
            });

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text('Generated by Narrow Fitness Portal', 105, 290, { align: 'center' });
            }

            doc.save('NarrowFitness_Full_Report.pdf');
        });
    }
});
