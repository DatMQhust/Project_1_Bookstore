const express = require('express');
const auth = require('./auth');
const { prefixAdmin } = require('../../config/system');
module.exports = (app) =>{
    app.use('/',auth)
}