//helpers.js
function checkLogin(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        // User not logged in --> redirect to the login page
        return res.redirect('/');
    }
}
function setFormMessage(res, type, message, view = 'login') {
    res.render(view, { [type]: message });
}

module.exports = {
    checkLogin,
    setFormMessage
}