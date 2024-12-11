const db = require('../../config/databaseMySQL')
const searchHelper = require('../../helpers/search');
const pageHelper = require('../../helpers/pagination');
const search = require('../../helpers/search');

// [GET] /admin/dashboard

module.exports.index = async (req,res)=>{
    const [activities] = await db.execute(
        "SELECT activity_type, description, created_at FROM recent_activities ORDER BY created_at DESC LIMIT 5"
      );
    res.render("admin/page/dashboard/index",{
        pageTitle:"Dashboard",
        user:req.user,
        activities:activities
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