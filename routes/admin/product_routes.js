const express = require('express')
const router = express.Router()
const upload = require('../../middlewares/upload')
const passport = require('passport')
const controller = require("../../controllers/admin/product_controller")
const passportJWT = passport.authenticate("jwt-admin", {
    failureRedirect: "/404",
    session: false,
});
router.get('/',passportJWT,controller.index)
router.get('/delete/:isbn',passportJWT,controller.delete)
router.get('/create',passportJWT,controller.create)
router.post('/create',passportJWT,upload.single('image'),controller.createPost)
router.get('/edit/:isbn',passportJWT,controller.edit)
router.post('/edit/:isbn',passportJWT,upload.single('image'),controller.editPost)
router.get('/deleted',passportJWT,controller.deleted)
router.get('/detail/:isbn',passportJWT,controller.detail)
module.exports = router