const express = require('express')
const bodyParser = require('body-parser')
const systemConfig  = require('./config/system')
const morgan = require('morgan')
require('dotenv').config()
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const dbmysql = require('./config/databaseMySQL')
const path = require('path');
const app = express()
const port = process.env.PORT || 3000
// Middleware
app.use(cookieParser());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// Biến toàn cục
app.locals.prefixAdmin = systemConfig.prefixAdmin
// Cấu hình express-session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Cấu hình connect-flash
app.use(flash());

// Middleware để đưa flash messages vào biến cục bộ cho tất cả các view
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

const passport = require("./middlewares/passport");
app.use(passport.initialize());
// View engine setup
app.set('views', `${__dirname}/views`); // Tìm đến thư mục tên là views
app.set('view engine', 'pug'); // template engine sử dụng: pug
// Routes
const adminRoutes = require("./routes/admin/index_routes");
adminRoutes(app)
const auth = require('./routes/auth/index');
auth(app);
// const clientRoutes = require("./routes/client/index_routes")
// clientRoutes(app)
// Static file
app.use(express.static(`${__dirname}/public`));

app.use('/uploads', express.static('uploads'));



app.get('/test', async (req, res) => {
  try {
    const rows = await dbmysql.query('SELECT * FROM product');
    console.log(rows[0])
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database query failed' });
  }
});

// App listen
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})