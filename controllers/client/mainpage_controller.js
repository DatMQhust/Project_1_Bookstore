
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
module.exports.profile = async (req,res) =>{
    const [user] = await db.execute('select * from user where userID = ?',[req.user.userID])
    if (user.length != 0){
        res.render('client/page/user/profile',{
            user:user[0]
        })
    }
}
module.exports.update = async (req,res) =>{
    try{
        await db.execute('update user set fullname = ?, email = ?, phone = ? where userID = ?',[req.body.name,req.body.email,req.body.phone,req.user.userID])
        req.flash('success_msg','Cập nhật thông tin thành công')
    }catch(err){
        req.flash('error_msg','Cập nhật thông tin thất bại')
    }
    res.redirect('/profile')
}