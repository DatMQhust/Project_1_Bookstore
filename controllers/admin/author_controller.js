const db = require('../../config/databaseMySQL')
const searchHelper = require('../../helpers/search');
const pageHelper = require('../../helpers/pagination');
const search = require('../../helpers/search');

// [GET] /admin/author
module.exports.index = async (req,res) =>{
    const [countResult] = await db.execute('select count(*) as total from author');
    const count = countResult[0].total;
    const {page,limit,offset,totalPage} = pageHelper(req.query,count)
    let keyword = ""
    if (req.query.search){
        keyword= req.query.search
    }
    const [authors] = await db.execute(`select * from author where name LIKE ? LIMIT ? OFFSET ? `,[`%${keyword}%`,`${limit}`,`${offset}`])
    res.render('admin/page/author/index',{
        user:req.user,
        authors:authors,
        totalPage: totalPage,
        currentPage: page
    })
}
module.exports.listProduct = async (req,res)=>{
    const name = req.params.name;
    const count = req.params.slg;
    
    const {page,limit,offset,totalPage} = pageHelper(req.query,count)
    let keyword = ""
    if (req.query.search){
        keyword= req.query.search
    }

    try{
        const [author] = await db.execute('select * from author where name = ?',[name])
        if (author.length == 0){
            return res.status(404).send('Không tìm thấy tác giả với tên đã cho')
        }
        const [product] = await db.execute(`select product.* from product,author,productauthor 
                                            where product.productID = productauthor.productID 
                                            and author.authorID = productauthor.authorID 
                                            and author.name = ? and product.name LIKE ? LIMIT ? OFFSET ? `,[name,`%${keyword}%`,`${limit}`,`${offset}`])
        res.render('admin/page/product/index',{
            products:product,
            user:req.user,
            totalPage: totalPage,
            currentPage: page
        })
    }
    catch(err){
        console.error('Lỗi:', err);
    }
}