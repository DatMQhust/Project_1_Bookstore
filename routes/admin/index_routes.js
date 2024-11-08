const express = require('express');
const dashboard = require('./dashboard_routes');
const product = require('./product_routes');
module.exports = (app) =>{
    app.use("/admin",dashboard)
    app.use("/admin",product)
}