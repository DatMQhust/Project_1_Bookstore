const express = require('express');
const router = express.Router();
const passport = require('passport')
const controller = require("../../controllers/client/mainpage_controller")
const passportJWT = passport.authenticate("jwt", {
    failureRedirect: "/404",
    session: false,
});
router.get('/',controller.index)
router.get('/profile',passportJWT,controller.profile)
router.post('/update',passportJWT,controller.update)
module.exports = router