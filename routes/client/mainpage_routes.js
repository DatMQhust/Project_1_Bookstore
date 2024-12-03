const express = require('express');
const router = express.Router();
const passport = require('passport')
const controller = require("../../controllers/client/mainpage_controller")
const passportJWT = passport.authenticate("jwt", {
    failureRedirect: "/404",
    session: false,
});
router.get('/',controller.index)
router.get('/list',passportJWT,controller.list)
router.get('/profile',passportJWT,controller.profile)
router.post('/update',passportJWT,controller.update)
router.post('/like/:id',passportJWT,controller.like)
router.get('/saved',passportJWT,controller.saved)
router.get('/detail/:id',controller.detail)
router.post('/comment/:id',passportJWT,controller.commendSend)
module.exports = router