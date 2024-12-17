const db = require('../../config/databaseMySQL')
const searchHelper = require('../../helpers/search');
const pageHelper = require('../../helpers/pagination');
const search = require('../../helpers/search');

// [GET] /admin/dashboard

module.exports.index = async (req,res)=>{
    const [activities] = await db.execute(
        "SELECT activity_type, description, created_at FROM recent_activities ORDER BY created_at DESC LIMIT 3"
      );
    const [product] = await db.execute('select count(*) as total from product')
    const [userc] = await db.execute('select count(*) as total from user')
    const [comment] = await db.execute('select count(*) as total from comment')
    const [category] = await db.execute('select count(*) as total from category')
    const [penddingcomment] = await db.execute('select count(*) as total from penddingcomment')
    const [deleted] = await db.execute('select count(*) as total from product where status = "inactive"')
    res.render("admin/page/dashboard/index",{
        pageTitle:"Dashboard",
        user:req.user,
        activities:activities,
        product:product[0].total,
        userc:userc[0].total,
        comment:comment[0].total,
        category:category[0].total,
        penddingcomment:penddingcomment[0].total,
        deleted:deleted[0].total
    })
}  
module.exports.addRecentActivity = async (type, description) => {
    try {
      await db.execute(
        "INSERT INTO recent_activities (activity_type, description) VALUES (?, ?)",
        [type, description]
      );
    } catch (error) {
      console.error("Lỗi khi thêm hoạt động mới:", error);
    }
  };