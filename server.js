const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = 'database.json';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('./')); // Serve index.html

// --- Helper Functions ---
function getDB() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { users: [], records: [] };
    }
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// --- API Endpoints ---

// 1. Signup
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    const db = getDB();

    if (db.users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    db.users.push({ name, email, password });
    saveDB(db);
    res.json({ message: 'User created successfully', user: { name, email } });
});

// 2. Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const db = getDB();
    const user = db.users.find(u => u.email === email && u.password === password);

    if (user) {
        res.json({ message: 'Login successful', user: { name: user.name, email: user.email } });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// 3. Get User Data (Progress, Booking, Attendance)
app.get('/api/data/:email', (req, res) => {
    const db = getDB();
    const email = req.params.email;
    const record = db.records.find(r => r.email === email);

    res.json(record || { progress: [], bookings: [], attendance: [] });
});

// 4. Update User Data
app.post('/api/data', (req, res) => {
    const { email, type, data } = req.body;
    const db = getDB();
    let recordIndex = db.records.findIndex(r => r.email === email);

    if (recordIndex === -1) {
        db.records.push({ email, progress: [], bookings: [], attendance: [] });
        recordIndex = db.records.length - 1;
    }

    // Update specific field
    if (type === 'progress') db.records[recordIndex].progress = data;
    if (type === 'bookings') db.records[recordIndex].bookings = data;
    if (type === 'attendance') db.records[recordIndex].attendance = data;

    saveDB(db);
    res.json({ success: true });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`User Database File: ${path.resolve(DB_FILE)}`);
});
