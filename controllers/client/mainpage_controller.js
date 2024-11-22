const Product = require('../../models/product');
const search = require('../../helpers/search');
const pageHelper = require('../../helpers/pagination');
const db = require('../../config/databaseMySQL');
module.exports.index = async (req,res) =>{
    const [countResult] = await db.execute('select count(*) as total from product where status = "active"');
    const count = countResult[0].total;
    const {page,limit,offset,totalPage} = pageHelper(req.query,count)
    let keyword = ""
    if (req.query.search){
        keyword= req.query.search
    }
    let status = "active"

    const [product] = await db.execute(`select * from product where name LIKE ? and status = ? LIMIT ? OFFSET ? `,[`%${keyword}%`,`${status}`,`${limit}`,`${offset}`])
    res.render('client/page/home/index',{
        products:product,
        totalPage: totalPage,
        currentPage: page,
    })
    
}