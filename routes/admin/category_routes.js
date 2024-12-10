const express = require('express')
const router = express.Router()
const upload = require('../../middlewares/upload')
const passport = require('passport')
const controller = require("../../controllers/admin/category_controller")
const passportJWT = passport.authenticate("jwt-admin", {
    failureRedirect: "/404",
    session: false,
});
router.get('/',passportJWT,controller.index)
router.get('/:name/:slg',passportJWT,controller.listProduct)
router.post('/add',passportJWT,controller.add)
router.post('/delete',passportJWT,controller.delete)
router.post('/edit',passportJWT,controller.edit)

module.exports = router