const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY || 'super-secret-key';

const app = express();
const PORT = process.env.PORT || 5000;

// Update CORS to allow multiple origins (localhost and production)
const allowedOrigins = [
    'http://localhost:5000',
    'http://localhost:3000', // Add frontend localhost
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Backend API is running!',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            items: '/api/items',
            itemById: '/api/items/:id',
            login: '/api/login',
            logout: '/api/logout',
            me: '/api/me'
        }
    });
});

// Basic Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});
app.use(cookieParser());
app.use(bodyParser.json());

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;

    // Support NextAuth by checking for a custom header sent by the frontend
    // In a production app, you would verify the session token/JWT properly
    const nextAuthUser = req.headers['x-auth-user'];
    if (nextAuthUser) {
        try {
            req.user = JSON.parse(nextAuthUser);
            return next();
        } catch (e) {
            // Invalid JSON, continue to token check
        }
    }

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Forbidden" });
        req.user = user;
        next();
    });
};

// Data file path - Vercel is read-only source except /tmp
const DATA_FILE = process.env.VERCEL
    ? path.join('/tmp', 'data.json')
    : path.join(__dirname, 'data.json');

// Helper to read data
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = [
            { id: 1, name: "Premium Laptop", description: "High-performance laptop for professionals with 32GB RAM and 1TB SSD.", price: 1200, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80" },
            { id: 2, name: "Wireless Headphones", description: "Noise-cancelling over-ear headphones with 40-hour battery life.", price: 250, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80" },
            { id: 3, name: "Smart Watch", description: "Stay connected with this sleek smartwatch featuring health tracking and GPS.", price: 199, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80" },
            { id: 4, name: "Professional Camera", description: "Mirrorless camera with ultra-fast autofocus and 4K video recording capability.", price: 1800, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80" },
            { id: 5, name: "Mechanical Keyboard", description: "Tactile mechanical keyboard with RGB lighting and programmable keys for developers.", price: 120, image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&q=80" },
            { id: 6, name: "Ultra-Wide Monitor", description: "34-inch curved monitor with vibrant colors and high refresh rate for immersive work.", price: 650, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80" },
            { id: 7, name: "Ergonomic Office Chair", description: "Premium ergonomic chair designed for long-term comfort and posture support.", price: 450, image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80" }
        ];
        // In Vercel, we can only write to /tmp. 
        // If it doesn't exist in /tmp yet, we write it.
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Auth Routes
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // Mock user validation
    if (username === 'admin' && password === 'admin') {
        const user = { username: 'admin', role: 'admin' };
        const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 3600000 // 1 hour
        });
        return res.json({ message: "Logged in successfully", user });
    }
    res.status(401).json({ message: "Invalid credentials" });
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Logged out successfully" });
});

app.get('/api/me', authenticateToken, (req, res) => {
    res.json(req.user);
});

// Routes
app.get('/api/items', (req, res) => {
    res.json(readData());
});

app.get('/api/items/:id', (req, res) => {
    const items = readData();
    const item = items.find(i => i.id === parseInt(req.params.id));
    if (item) {
        res.json(item);
    } else {
        res.status(404).json({ message: "Item not found" });
    }
});

app.post('/api/items', authenticateToken, (req, res) => {
    const items = readData();
    const newItem = {
        id: Date.now(),
        ...req.body
    };
    items.push(newItem);
    writeData(items);
    res.status(201).json(newItem);
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
