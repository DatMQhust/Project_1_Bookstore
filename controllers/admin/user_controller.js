const db = require('../../config/databaseMySQL')
const searchHelper = require('../../helpers/search');
const pageHelper = require('../../helpers/pagination');
const search = require('../../helpers/search');

// [GET] /admin/user
module.exports.index = async (req,res)=>{
    const [countResult] = await db.execute('select count(*) as total from user');
    const count = countResult[0].total;
    const {page,limit,offset,totalPage} = pageHelper(req.query,count)
    let keyword = ""
    if (req.query.search){
        keyword= req.query.search
    }
    const [users] = await db.execute(`select user.*,roleID from user,role where user.userID = role.userID and fullname LIKE ? LIMIT ? OFFSET ? `,[`%${keyword}%`,`${limit}`,`${offset}`])
    res.render('admin/page/user/index',{
        pageTitle:"Người dùng",
        user:req.user,
        users:users,
        totalPage: totalPage,
        currentPage: page
    })
}

// [POST] /admin/user/change-role/:id
module.exports.changeRole = async (req, res) => {
    try {
        const id = req.params.id;
        const roleID = req.body.roleID;

        const [result] = await db.execute('update role set roleID = ? where userID = ?', [roleID, id]);
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Không tìm thấy người dùng hoặc cập nhật thất bại" });
        }

        res.status(200).json({ message: "Change role success" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

