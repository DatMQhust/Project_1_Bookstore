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

module.exports.replyCommentGet = async (req,res)=>{
  const id = req.params.id;
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
      pc.pendID = ?
    `,[id]);    
    console.log(comments);
  res.render('admin/page/comment/reply-comment',{
    user:req.user,
    comment:comments[0]
  })
}
module.exports.replyCommentPost = async (req, res) => {
  const { pendID: id, content } = req.body;
  const connection = await db.getConnection(); 
  try {
    await connection.beginTransaction(); 
    const [[pendingComment]] = await connection.execute(
      'SELECT productID, userID, content FROM penddingcomment WHERE pendID = ?',
      [id]
    );

    if (!pendingComment) {
      return res.status(404).send('Pending comment not found');
    }
    const [commentResult] = await connection.execute(
      'INSERT INTO comment(productID, userID, content) VALUES (?, ?, ?)',
      [pendingComment.productID, pendingComment.userID, pendingComment.content]
    );

    const commentID = commentResult.insertId;

    await connection.execute(
      'INSERT INTO reply(commentID, content) VALUES (?, ?)',
      [commentID, content]
    );
    await connection.execute('DELETE FROM penddingcomment WHERE pendID = ?', [id]);

    await connection.commit(); 
    res.redirect('/detail/' + pendingComment.productID);
  } catch (error) {
    await connection.rollback(); 
    console.error('Error in replyCommentPost:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    connection.release();
  }
};
module.exports.deleteComment = async (req, res) => {
  const id = req.body.pendID
  try{
    await db.execute('DELETE FROM penddingcomment WHERE pendID = ?',[id])
    res.status(200).json({success:true})
  }
  catch(err){
    res.status(500).json({success:false})
  }
}
