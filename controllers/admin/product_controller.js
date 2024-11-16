const Product = require('../../models/product')
const db = require('../../config/databaseMySQL')
const searchHelper = require('../../helpers/search');
const pageHelper = require('../../helpers/pagination');
const search = require('../../helpers/search');
// [GET] /admin/product
module.exports.index = async (req,res)=>{
    const count = await db.execute('select count(*) from product')
    const {page,limit,offset,totalPage} = pageHelper(req.query,count)
    let keyword = ""
    if (req.query.search){
        keyword= req.query.search
    }
    let status = "active"
    const [product] = await db.execute(`select * from product where name LIKE ? and status = ? LIMIT ? OFFSET ? `,[`%${keyword}%`,`${status}`,`${limit}`,`${offset}`])
   
    res.render('admin/page/product/index',{
        products:product,
        totalPage: totalPage,
        currentPage: page
    })
}

// [DELETE] /admin/product/delete/:isbn
module.exports.delete = async (req,res)=>{
    const isbn = req.params.isbn;
    await db.execute('update product set status = ? where isbn = ?',[
        'inactive',isbn
    ])
    res.redirect('back')
}

// [GET] /admin/product/create
module.exports.create = (req,res)=>{
    res.render('admin/page/product/create')
}
module.exports.createPost = async (req,res)=>{
    const [existingProduct] = await db.execute("select * from product where name = ?", [req.body.name]);
    if (existingProduct.length > 0) {
        req.flash('error_msg', 'Sản phẩm đã tồn tại');
        return res.render('admin/page/product/create');
    } else {
        if(req.file){
            req.body.image = `/uploads/${req.file.filename}`
        }
        
        req.body.price = parseInt(req.body.price)
        req.body.page = parseInt(req.body.page)
        req.body.publish_year = parseInt(req.body.publish_year)
        req.body.watched = 0
        try {
            await db.execute(`insert into product (name,author,description,categories,isbn,publisher,publish_year,language,price,image,watched,page,status) 
                                values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                                [req.body.name,req.body.author,req.body.description,req.body.categories,req.body.isbn,req.body.publisher,req.body.publish_year,req.body.language,req.body.price,req.body.image,req.body.watched,req.body.page,req.body.status]);
            req.flash('success_msg','Tạo sản phẩm thành công');
            res.redirect('/admin/product');
        } catch (error) {
            console.error('Database error:', error);
            req.flash('error_msg', 'Không thể tạo sản phẩm.');
            res.redirect('/admin/product');
        }
}
}
// [GET] /admin/product/edit/:isbn
module.exports.edit = async (req,res)=>{
    const isbn = (req.params.isbn);
    const [product] = await db.execute(`select * from product where isbn = ?`,[isbn])
    res.render('admin/page/product/edit',{
        product:product[0]
    })
}
// [POST] /admin/product/edit/:isbn
module.exports.editPost = async (req,res)=>{
    const isbn = req.params.isbn;
    req.body.price = parseInt(req.body.price)
    req.body.page = parseInt(req.body.page)
    req.body.publish_year = parseInt(req.body.publish_year)
    if(req.file){
        req.body.image = `/uploads/${req.file.filename}`
        await db.execute('update product set image = ? where isbn = ?',[req.body.image,isbn])
    }
    await db.execute(`update product set name = ?,author = ?,description = ?,categories = ?,publisher = ?,publish_year = ?,language = ?,price = ?,page = ?,status = ? where isbn = ?`,
                    [req.body.name,req.body.author,req.body.description,req.body.categories,req.body.publisher,req.body.publish_year,req.body.language,req.body.price,req.body.page,req.body.status,isbn])
    req.flash('success_msg','Sửa sản phẩm thành công');
    res.redirect('/admin/product')
}

// [GET] /admin/product/deleted
module.exports.deleted = async (req,res)=>{
    const [product] = await db.execute('select * from product where status = ?',['inactive'])
    res.render('admin/page/product/deleted',{
        products:product
    })
}