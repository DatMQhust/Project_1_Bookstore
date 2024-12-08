const db = require('../../config/databaseMySQL')
const searchHelper = require('../../helpers/search');
const pageHelper = require('../../helpers/pagination');
const search = require('../../helpers/search');

// [GET] /admin/category
module.exports.index = async (req,res)=>{
    const [countResult] = await db.execute('select count(*) as total from category');
    const count = countResult[0].total;
    const {page,limit,offset,totalPage} = pageHelper(req.query,count)
    let keyword = ""
    if (req.query.search){
        keyword= req.query.search
    }
    const [categories] = await db.execute(`select * from category where name LIKE ? LIMIT ? OFFSET ? `,[`%${keyword}%`,`${limit}`,`${offset}`])
    const [rows] = await db.execute(`
        SELECT category.name, COUNT(product.categoryID) AS 'Số lượng sách'
        FROM category
        LEFT JOIN product ON category.categoryID = product.categoryID
        GROUP BY category.categoryID;
    `);
    
    const numberBooks = rows.map(row => row['Số lượng sách']);
    res.render('admin/page/category/index',{
        user:req.user,
        categories:categories,
        totalPage: totalPage,
        currentPage: page,
        numberBook: numberBooks
    })
}