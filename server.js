const express = require('express');
const sessions = require('express-session');
const app = express();
const path = require("path");
const pool = require('./utils/db');
const mainRoutes = require('./routes/mainRoutes');
const authRoutes = require('./routes/authRoutes');

// Log database connection status
pool.getConnection((error, connection) => {
    if (error) {
        console.log('Error connecting to MySQL:', error);
    } else {
        console.log('MySQL connected!');
        connection.release();
    }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(
    sessions({
        secret: 'thisis my secrctekey',
        saveUninitialized: false,
        cookie: { maxAge: 300000 }
    })
);

app.use((req, res, next) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '-1');
    next();
});

app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'hbs');

// Static public dir
app.use(express.static(__dirname + '/public'));

app.use('/', mainRoutes);
app.use('/auth', authRoutes);

app.listen(5000, () => {
    console.log('Server started on port 5000');
});
