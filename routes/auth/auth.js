const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../../config/databaseMySQL');
const controller = require('../../controllers/auth');

router.post('/register', controller.register);
router.get('/register', (req, res) => {
    const token = req.cookies['session'];
    if (token){
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {;
            if (err) {
                 res.render('auth/register');
            }
             res.redirect('/');
        });
    }
    else {
        res.render('auth/register');
    }
});

router.post('/login', controller.login);
router.get('/login', (req, res) => {
    const token = req.cookies['session'];
    if (token){
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.render('auth/login');
            }
            return res.redirect('/');
        });
    }
    else {
        res.render('auth/login');
    }
});

router.get('/is-logged-in',controller.isLoggedIn);
module.exports = router;