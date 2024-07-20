const express = require('express');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const path = require('path');
const UserData = require('./models/UserData');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

app.post('/submit', async (req, res) => {
    const { name, email, data } = req.body;

    // Dynamically import nanoid inside the async function
    const { nanoid } = await import('nanoid');

    const newUser = new UserData({
        name,
        email,
        data,
    });

    try {
        await newUser.save();
        const qrCodeUrl = await QRCode.toDataURL(`${req.protocol}://${req.get('host')}/user/${newUser._id}`);
        res.json({ qrCodeUrl });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

app.get('/user/:id', async (req, res) => {
    try {
        const user = await UserData.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>User Details</title>
                <link rel="stylesheet" href="/main.css">
            </head>
            <body>
                <div class="user-details">
                    <h1>User Details</h1>
                    <p><strong>Name:</strong> ${user.name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Data:</strong> ${user.data}</p>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error retrieving user data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
