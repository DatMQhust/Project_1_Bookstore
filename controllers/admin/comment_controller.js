const db = require("../../config/databaseMySQL")
const searchHelper = require('../../helpers/search');
const pageHelper = require('../../helpers/pagination');
const search = require('../../helpers/search');
module.exports.index = async (req, res) => {
    const [countResult] = await db.execute('select count(*) as total from penddingcomment');
    const count = countResult[0].total;
    const {page,limit,offset,totalPage} = pageHelper(req.query,count)
    let keyword = ""
    if (req.query.search){
        keyword= req.query.search
    }
    const [comments] = await db.execute(`
        SELECT 
          pc.*, 
          p.name AS productName, 
          u.fullname AS userFullname 
        FROM 
          penddingcomment pc
        LEFT JOIN 
          product p ON p.productID = pc.productID
        LEFT JOIN 
          user u ON u.userID = pc.userID
        WHERE 
          p.name LIKE ? 
        LIMIT ? OFFSET ?
      `,[`%${keyword}%`,`${limit}`,`${offset}`]);
    
      
    res.render('admin/page/comment/index',{
        user:req.user,
        comments:comments,
        totalPage: totalPage,
        currentPage: page
    })
}