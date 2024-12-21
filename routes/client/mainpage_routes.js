const express = require('express');
const router = express.Router();
const passport = require('passport')
const controller = require("../../controllers/client/mainpage_controller")
dashboard_controller = require('../../controllers/client/dashboard_controller')
const passportJWT = passport.authenticate("jwt", {
    failureRedirect: "/404",
    session: false,
});
router.get('/',dashboard_controller.index)
router.get('/list/all',controller.list)
router.get('/list/:type',dashboard_controller.list)
router.get('/list/category/:id',dashboard_controller.listCategory)
router.get('/profile',passportJWT,controller.profile)
router.post('/update',passportJWT,controller.update)
router.post('/like/:id',passportJWT,controller.like)
router.get('/saved',passportJWT,controller.saved)
router.get('/detail/:id',controller.detail)
router.post('/comment/:id',passportJWT,controller.commendSend)
router.get('/search',dashboard_controller.searchPost)
module.exports = router