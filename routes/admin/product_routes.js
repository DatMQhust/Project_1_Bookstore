const express = require('express')
const router = express.Router()
const controller = require("../../controllers/admin/product_controller")
router.get('/product',controller.index)
router.get('/product/delete/:id',controller.delete)
router.get('/product/create',controller.create)
router.post('/product/create',controller.createPost)
module.exports = router