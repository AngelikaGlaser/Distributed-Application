const express = require('express');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const app = express();
const pool = require('./utils/db');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require("path");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session middleware
app.use(
    sessions({
        secret: 'thisismysecrctekey',
        saveUninitialized: true,
        cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
        resave: false,
    })
);

app.use(cookieParser());

app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'hbs');

// Static public dir
app.use(express.static(__dirname + '/public'));

pool.getConnection((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log('MySQL connected!');
    }
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    const errorType = req.query.error;
    res.render('register', { errorType });
});

app.get('/success', (req, res) => {
    const username = req.session.username;
    if (!username) {
        // Handle the case where the username is not available in the session
        return res.redirect('/login'); // Redirect to the login page
    }
    res.render('success', { username });
});

// Route to check if a username is already in use
app.get('/check-username', async (req, res) => {
    const usernameToCheck = req.query.username;

    try {
        // Query the database to check if the provided username is in use
        const query = 'SELECT COUNT(*) AS count FROM users WHERE username = ?';
        pool.query(query, [usernameToCheck], (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Server error' });
                return;
            }

            if (results[0].count > 0) {
                // Username is already in use
                res.json({ usernameInUse: true });
            } else {
                // Username is available
                res.json({ usernameInUse: false });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/check-email', (req, res) => {
    const emailToCheck = req.query.email;

    try {
        // Query the database to check if the provided email is in use
        const query = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
        pool.query(query, [emailToCheck], (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Server error' });
                return;
            }

            if (results[0].count > 0) {
                // Email is already in use
                res.json({ emailInUse: true });
            } else {
                // Email is available
                res.json({ emailInUse: false });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/auth/register', async (req, res) => {
    const { username, email, password, password_confirm } = req.body;

    try {
        // Check if the email is already in use
        const emailInUse = await new Promise((resolve, reject) => {
            pool.query('SELECT email FROM users WHERE email = ?', [email], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.length > 0);
                }
            });
        });

        if (emailInUse) {
            // Display an alert for email in use
            return res.redirect('/register?error=emailInUse');
        }

        if (password !== password_confirm) {
            // Display an alert for password mismatch
            return res.redirect('/register?error=passwordMismatch');
        }

        // Hash the password and insert the user into the database (if not in use)
        const hashedPassword = await bcrypt.hash(password, 8);
        pool.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            (error, result) => {
                if (error) {
                    // Display an alert for server error
                    return res.redirect('/register?error=serverError');
                }
                // After successful registration, stores the user's name in the session
                req.session.username = username;
                //redirects the user to success page
                return res.redirect('/success');
            }
        );
    } catch (error) {
        console.error(error);
        // Display an alert for server error
        return res.redirect('/register?error=serverError');
    }
});

app.listen(5000, () => {
    console.log('Server started on port 5000');
});
