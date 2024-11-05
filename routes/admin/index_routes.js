const express = require('express');
const dashboard = require('./dashboard_routes');
module.exports = (app) =>{
    app.use("/admin",dashboard)
}