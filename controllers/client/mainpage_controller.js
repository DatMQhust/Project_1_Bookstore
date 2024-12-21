
const search = require('../../helpers/search');
const pageHelper = require('../../helpers/pagination');
const db = require('../../config/databaseMySQL');
const {addRecentActivity} = require('../admin/dashboard_controller')
module.exports.index = async (req,res) => {
    
    res.render('client/layout/default')
}
// [GET] /list/all
module.exports.list = async (req,res) =>{
    const keyword = req.query.search ? req.query.search.trim() : "";
    let status = "active"
    const [countResult] = await db.execute('select count(*) as total from product where status = "active" and name LIKE ?',[`%${keyword}%`]);
    const count = countResult[0].total;
    const {page,limit,offset,totalPage} = pageHelper(req.query,count)
    
    const userID = req.user.userID
    const [product] = await db.execute(`select p.*,CASE WHEN l.productID IS NOT NULL THEN true ELSE false END AS isLiked
                                         from product p
                                         left join liked l on p.productID = l.productID and l.userID = ?
                                         where name LIKE ? and status = ? LIMIT ? OFFSET ? `,[`${userID}`,`%${keyword}%`,`${status}`,`${limit}`,`${offset}`])
    res.render('client/page/home/list',{
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
module.exports.like = async (req,res) =>{
    const id = req.body.id
    const userID = req.user.userID
    const [checkLike] = await db.execute('select * from liked where productID = ? and userID = ?',[id,userID])
    if (checkLike.length == 0){
        await db.execute('insert into liked (productID,userID) values (?,?)',[id,userID])
        await db.execute('update product set watched = watched + 1 where productID = ?',[id])
    }
    else {
        return res.status(400).json({message:"Đã thích sản phẩm này"})
    }
    res.status(200).json({message:"ok"})
}

module.exports.saved = async (req,res)=>{
    const userID = req.user.userID
    const [product] = await db.execute('select product.* from product,liked where product.productID = liked.productID and liked.userID = ?',[userID])
    res.render('client/page/user/saved',{
        products:product
    })
}

module.exports.detail = async (req, res) => {
    const id = req.params.id;
    const [product] = await db.execute('select * from product where productID = ?', [id]);
    if (product.length == 0) {
        return res.redirect('/404');
    }
    const [authors] = await db.execute('select author.name from author, productauthor where author.authorID = productauthor.authorID and productauthor.productID = ?', [id]);
    // const query = `select c.*,u.fullname,r.replyID,r.content as reply_content from comment c,user u,reply r where c.productID = ? and c.userID = u.userID and r.commentID = c.commentID`;
    // const [comments] = await db.execute(query, [id]);

    const query = `
    SELECT c.*, u.fullname, r.replyID, r.content AS reply_content, r.created_at as time
    FROM comment c
    JOIN user u ON c.userID = u.userID
    LEFT JOIN reply r ON r.commentID = c.commentID
    WHERE c.productID = ?
`;
    const [rows] = await db.execute(query, [id]);

    const commentsMap = new Map();
    rows.forEach((row) => {
        if (!commentsMap.has(row.commentID)) {
            commentsMap.set(row.commentID, {
                ...row,
                reply: []
            });
        }
        if (row.replyID) {
            commentsMap.get(row.commentID).reply.push({
                replyID: row.replyID,
                content: row.reply_content,
                time: row.time
            });
        }
    });

    const comments = Array.from(commentsMap.values());
    const author = authors.map(author => author.name).join(', ');
    console.log(author)
    res.render('client/page/product/index', {
        authors: author,
        product: product[0],
        comments: comments
    });
    
}
module.exports.commendSend = async (req,res)=>{
    const id = req.body.id;
    const content = req.body.content;
    const userID = req.user.userID;
    try{
        await db.execute("insert into penddingcomment (productID,userID,content) values (?,?,?)",[id,userID,content])
        await addRecentActivity('comment', `Bình luận mới: "${content}"`);
        res.status(200).json({success: true,message:"ok"})
    }
    catch(err){
        res.status(400).json({success: false,message:"error"})
    }
}