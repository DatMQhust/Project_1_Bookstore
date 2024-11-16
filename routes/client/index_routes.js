const express = require('express');
const mainpage = require('./mainpage_routes');
module.exports = (app) =>{
    app.use('/',mainpage)
}