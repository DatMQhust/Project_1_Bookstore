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
module.exports.listProduct = async (req,res)=>{
    const name = req.params.name;
    const count = req.params.slg;
    const {page,limit,offset,totalPage} = pageHelper(req.query,count)
    let keyword = ""
    if (req.query.search){
        keyword= req.query.search
    }
    try {
        const [id] = await db.execute('select categoryID from category where name = ?', [name]);
        const categoryID = id[0]?.categoryID;
      
        if (!categoryID) {
          return res.status(404).send('Không tìm thấy category với tên đã cho');
        }
      
        const [product] = await db.execute(
          'select * from product where categoryID = ? and name LIKE ? LIMIT ? OFFSET ?',
          [categoryID, `%${keyword}%`,`${limit}`,`${offset}`]
        );
      
        res.render("admin/page/product/index", {
          products: product,
          user: req.user,
          totalPage: totalPage,
          currentPage: page,
        });
      } catch (err) {
        console.error('Lỗi:', err);
        res.status(500).send('Có lỗi xảy ra trên server.');
      }     
}
module.exports.add = async (req,res) =>{
    const name = req.body.name;
    const [cate] = await db.execute(`select * from category where name = ?`,[name]);
    if (cate.length != 0){
        return res.status(500).json({success : false,message : "Danh mục đã tồn tại"})
    }
    else {
        try{
            await db.execute(`insert into category(name) values (?)`,[name]);
            return res.status(200).json({success : true,message : "Thêm danh mục thành công "})
        }
        catch(e) {
            return res.status(401).json({success: false, message:"Có lỗi xảy ra vui lòng thử lại"})
        }
        
    }
}
module.exports.delete = async (req,res) =>{
    const id = req.body.id;
    console.log(id)
    const [result] = await db.execute(`select * from product where categoryID = ?`,[id]);
    if (result.length != 0){
        return res.status(500).json({success : false,message : "Danh mục đang chứa sản phẩm không thể xóa! Hãy xoá sản phẩm hoặc thay đổi danh mục sản phẩm trước khi xóa danh mục"})
    }
    try{
        await db.execute(`delete from category where categoryID = ?`,[id]);
        return res.status(200).json({success : true,message : "Xóa danh mục thành công "})
    }
    catch(e){
        return res.status(401).json({success: false, message:"Có lỗi xảy ra vui lòng thử lại"})
    }
}
module.exports.edit = async (req,res) =>{
    const id = req.body.id;
    const name = req.body.name;
    const [cate] = await db.execute(`select * from category where name = ?`,[name]);
    if(cate.length != 0){
        return res.status(500).json({success : false,message : "Danh mục đã tồn tại"})
    }
    else{
        try{
            await db.execute(`update category set name = ? where categoryID = ?`,[name,id]);
            return res.status(200).json({success : true,message : "Sửa danh mục thành công "})
        }
        catch(e){
            return res.status(401).json({success: false, message:"Có lỗi xảy ra vui lòng thử lại"})
        }
     }    

}