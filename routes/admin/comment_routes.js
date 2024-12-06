const express = require('express')
const router = express.Router()
const upload = require('../../middlewares/upload')
const passport = require('passport')
const controller = require("../../controllers/admin/comment_controller")
const passportJWT = passport.authenticate("jwt-admin", {
    failureRedirect: "/404",
    session: false,
});
router.get('/',passportJWT,controller.index)
router.get('/reply-comment/:id',passportJWT,controller.replyCommentGet)
router.post('/reply-comment/:id',passportJWT,controller.replyCommentPost)
router.post('/delete',passportJWT,controller.deleteComment)
module.exports = router