const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000
// body parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.get('/', (req, res) => {
  res.send('Hello World!')
})
// View engine setup
app.set('views', `${__dirname}/views`); // Tìm đến thư mục tên là views
app.set('view engine', 'pug'); // template engine sử dụng: pug
// Static file
app.use(express.static(`${__dirname}/public`));
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})