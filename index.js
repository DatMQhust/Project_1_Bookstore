const express = require('express')
const bodyParser = require('body-parser')
const systemConfig  = require('./config/system')
const morgan = require('morgan')
require('dotenv').config()
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
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

// Cấu hình express-flash
app.use(cookieParser('hgljfhlgjhdfli'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie : {maxAge: 60000}
}));
app.use(flash());


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
const clientRoutes = require("./routes/client/index_routes")
clientRoutes(app)
// Static file
app.use(express.static(`${__dirname}/public`));

app.use('/uploads', express.static('uploads'));



app.get('/test', async (req, res) => {
  res.render("test/test2.pug")
});
app.get('/get-category', async (req, res) => {
  const [category] = await dbmysql.execute('select * from category')
  res.json(category)
});
// App listen
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})