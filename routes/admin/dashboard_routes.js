const express = require('express')
const router = express.Router()
const controller = require("../../controllers/admin/dashboard_controller")
const passport = require('passport')
const passportJWT = passport.authenticate("jwt-admin", {
    failureRedirect: "/404",
    session: false,
});
router.get('/dashboard',passportJWT,controller.index)
module.exports = router