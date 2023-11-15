const express = require('express');
const router = express.Router();
const {checkLogin} = require('../public/helpers/helpers');

router.get('/', (req, res) => {
    res.render('login', { error: req.query.error || null });
});

router.get('/register', (req, res) => {
    const errorType = req.query.error;
    res.render('register', { errorType });
});

router.get('/success', checkLogin, (req, res) => {
    res.render('success', { username: req.session.user.username });
});

router.get('/logout', (req, res) => {
    req.session.destroy(function (){
        console.log('User logged out!');
    });

    res.redirect(303, '/');
});

module.exports = router;