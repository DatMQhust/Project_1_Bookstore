const express = require('express');
const dashboard = require('./dashboard_routes');
const product = require('./product_routes');
const user = require('./user_routes');
const comment = require('./comment_routes');
const { prefixAdmin } = require('../../config/system');
module.exports = (app) =>{
    app.use(`/${prefixAdmin}`,dashboard)
    app.use(`/${prefixAdmin}/product`,product)
    app.use(`/${prefixAdmin}/user`,user)
    app.use(`/${prefixAdmin}/comment`,comment)
}