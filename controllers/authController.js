const pool = require('../utils/db');
const bcrypt = require('bcryptjs');
const { setFormMessage } = require('../public/helpers/helpers');

const register = async (req, res) => {
    const username = req.body.username.trim();
    const email = req.body.email.trim();
    const password = req.body.password.trim();
    const confirmPassword = req.body.confirmPassword.trim();

    if (!username || !email || !password || !confirmPassword) {
        req.session.enteredName = username;
        req.session.enteredEmail = email;
        return setFormMessage(res, 'error', 'Please fill all fields', 'register');
    }

    if (password.length < 10) {
        req.session.enteredName = username;
        req.session.enteredEmail = email;
        return setFormMessage(res, 'error', 'Password must be at least 10 characters long', 'register');
    }

    if (password !== confirmPassword) {
        req.session.enteredName = username;
        req.session.enteredEmail = email;
        return setFormMessage(res, 'error', 'Passwords do not match', 'register');
    }

    // Check if username or email already exists in the database
    pool.query('SELECT * FROM myform.users WHERE username = ? OR email = ?', [username, email], async function (error, results, fields) {
        if (error) {
            console.error('Database error during registration:', error);
            return res.send({
                code: 500,
                error: "Internal server error"
            });
        }

        if (results.length > 0) {
            req.session.enteredName = username;
            req.session.enteredEmail = email;
            return setFormMessage(res, 'error', 'Email or username already in use', 'register');
        }

        // If no existing records, proceed with user insertion
        const hashedPassword = await bcrypt.hash(password, 10);
        // Insert the new user into the database
        pool.query('INSERT INTO myform.users (username, email, hashedPassword) VALUES (?, ?, ?)', [username, email, hashedPassword], function (error, results, fields) {
            if (error) {
                console.error('Database error during registration:', error);
                return res.send({
                    code: 500,
                    error: "Internal server error"
                });
            }

            req.session.user = {username: username};

            res.redirect('/success');
        });
    });
};

const login = async (req, res) => {
    const identifier = req.body.identifier.trim();
    const password = req.body.password;

    if (!identifier || !password) {
        req.session.enteredIdentifier = identifier;

        return setFormMessage(res, 'error', 'Please fill all fields');
    }

    try {
        pool.query('SELECT * FROM myform.users WHERE username = ? OR email = ?', [identifier, identifier], async function (error, results, fields) {
            if (error) {
                res.send({
                    "code":400,
                    "failed":"error occurred"
                })
            }else {
                const user = results[0];
                // Check if there are any rows in the result set
                if (!user) {
                    req.session.enteredIdentifier = identifier;
                    // No user with this identifier
                    return setFormMessage(res, 'error', 'Invalid credentials');
                }
                // Password vs hashed password
                const passwordMatch = await bcrypt.compare(password, user.hashedpassword);

                if (!passwordMatch) {
                    req.session.enteredIdentifier = identifier;
                    // Passwords do not match
                    return setFormMessage(res, 'error', 'Invalid credentials');
                }

                delete req.session.enteredIdentifier;
                // Set the user in the session
                req.session.user = {username: user.username};

                res.redirect('/success');
            }
        })
    } catch (error) {
        console.error('Error during login:', error);
        return setFormMessage(res, 'error', 'Internal server error');
    }
};

module.exports = {
    register,
    login,
};