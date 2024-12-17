
const db = require('../../config/databaseMySQL')
const searchHelper = require('../../helpers/search');
const pageHelper = require('../../helpers/pagination');
const search = require('../../helpers/search');
// [GET] /admin/product
module.exports.index = async (req,res)=>{
    const [countResult] = await db.execute('select count(*) as total from product where status = "active"');
    const count = countResult[0].total;
    const {page,limit,offset,totalPage} = pageHelper(req.query,count)
    let keyword = ""
    if (req.query.search){
        keyword= req.query.search
    }
    let status = "active"
    const [product] = await db.execute(`select * from product as p where name LIKE ? and status = ? LIMIT ? OFFSET ? `,[`%${keyword}%`,`${status}`,`${limit}`,`${offset}`])
    res.render('admin/page/product/index',{
        pageTitle:"Sản phẩm",
        user:req.user,
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
module.exports.create = async (req,res)=>{
    const [categories]  = await db.execute ('select * from category')
    res.render('admin/page/product/create',{
        categories:categories
    })
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
        req.body.price = isNaN(parseInt(req.body.price)) ? 0 : parseInt(req.body.price);
        req.body.page = isNaN(parseInt(req.body.page)) ? 0 : parseInt(req.body.page);
        req.body.publish_year = isNaN(parseInt(req.body.publish_year)) ? 0 : parseInt(req.body.publish_year);
        req.body.watched = 0
        
        const authors = req.body.author.split(',');
        const categories = parseInt(req.body.category);
        
        const connection = await db.getConnection();
        try {
        //     await connection.beginTransaction();
            const [result] = await db.execute(`insert into product (name,description,isbn,publisher,publish_year,language,price,image,watched,page,status,categoryID) 
                                values (?,?,?,?,?,?,?,?,?,?,?,?)`,
                                [req.body.name,req.body.description,req.body.isbn,req.body.publisher,req.body.publish_year,req.body.language,req.body.price,req.body.image,req.body.watched,req.body.page,req.body.status,categories]);

            const prID = result.insertId;
            for (const authorName of authors){
                const [author] = await db.execute(`select authorID from author where name = ?`,[authorName]);
                let authorID;
                if (author.length === 0){
                    const [result] = await db.execute(`insert into author (name,numberBook) values (?,?)`,[authorName,1]);
                    authorID = result.insertId;
                } else {
                    await db.execute(`update author set numberBook = numberBook + 1 where authorID = ?`,[author[0].authorID]);
                    authorID = author[0].authorID;
                }

                await db.execute(`insert into productauthor (productID,authorID) values (?,?)`,[prID,authorID]);
            }
                
            //await connection.commit();
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
    const [categories]  = await db.execute ('select * from category')
    const [authors] = await db.execute('select author.name from author,productauthor where author.authorID = productauthor.authorID and productauthor.productID = (select productID from product where isbn = ?)',[isbn])
    const authorlist  = authors.map(author => author.name).join(',')
    const [product] = await db.execute(`select * from product where isbn = ?`,[isbn])
    const category = await db.execute('select category.name from product, category where product.categoryID = category.categoryID and isbn = ?',[isbn])
    res.render('admin/page/product/edit',{
        product:product[0],
        categories:categories,
        categorydefault:category[0].name,
        authordefault:authorlist
    })
}
// [POST] /admin/product/edit/:isbn
module.exports.editPost = async (req,res)=>{
    const isbn = req.params.isbn;
    req.body.price = parseInt(req.body.price)
    req.body.page = parseInt(req.body.page)
    req.body.publish_year = parseInt(req.body.publish_year)
    req.body.category = parseInt(req.body.category)
    if(req.file){
        req.body.image = `/uploads/${req.file.filename}`
        await db.execute('update product set image = ? where isbn = ?',[req.body.image,isbn])
    }
    const [productID] = await db.execute('select productID from product where isbn = ?',[isbn])
    const prID = productID[0].productID;
    const authors = req.body.author.split(',');
    for (const authorName of authors) {
        const trimmedName = authorName;
        if (trimmedName) {
          const [existingAuthor] = await db.execute("SELECT authorID FROM author WHERE name = ?", [trimmedName]);
          let authorID;
  
          if (existingAuthor.length === 0) {
            const [newAuthor] = await db.execute("INSERT INTO author (name, numberBook) VALUES (?, ?)", [trimmedName, 1]);
            authorID = newAuthor.insertId;
          } else {
            authorID = existingAuthor[0].authorID;
          }
          const [linkCheck] = await db.execute(
            "SELECT * FROM productauthor WHERE productID = ? AND authorID = ?",
            [prID, authorID]
          );
  
          if (linkCheck.length === 0) {
            await db.execute("INSERT INTO productauthor (productID, authorID) VALUES (?, ?)", [prID, authorID]);
          }
        }
    }
    await db.execute(`update product set name = ?,description = ?,categoryID = ?,publisher = ?,publish_year = ?,language = ?,price = ?,page = ?,status = ? where isbn = ?`,
                    [req.body.name,req.body.description,req.body.category,req.body.publisher,req.body.publish_year,req.body.language,req.body.price,req.body.page,req.body.status,isbn])
    req.flash('success_msg','Sửa sản phẩm thành công');
    res.redirect('/admin/product')
}

// [GET] /admin/product/deleted
module.exports.deleted = async (req,res)=>{
    const [countResult] = await db.execute('select count(*) as total from product where status = "inactive"');
    const count = countResult[0].total;
    const {page,limit,offset,totalPage} = pageHelper(req.query,count)
    let keyword = ""
    if (req.query.search){
        keyword= req.query.search
    }
    let status = "inactive"
    const [product] = await db.execute(`select * from product where name LIKE ? and status = ? LIMIT ? OFFSET ? `,[`%${keyword}%`,`${status}`,`${limit}`,`${offset}`])
    res.render('admin/page/product/deleted',{
        user:req.user,
        products:product,
        totalPage: totalPage,
        currentPage: page
    })
}

// [GET] /admin/product/detail/:isbn
module.exports.detail = async (req,res) =>{
    const isbn = req.params.isbn;
    const [product] = await db.execute('select * from product where isbn = ?',[isbn]);
    const [category] = await db.execute("select category.name from category,product where category.categoryID = product.categoryID and productID = ?",[product[0].productID]);
    const [authors] = await db.execute('select author.name from author,productauthor where author.authorID = productauthor.authorID and productauthor.productID = ?',[product[0].productID])
    const authorlist  = authors.map(author => author.name).join(',');
    if (product.length === 0) {
        req.flash('error_msg', 'Không tìm thấy sản phẩm');
        return res.redirect('/admin/product');
    }
    else{
        res.render('admin/page/product/detail',{
            product:product[0],
            category:category[0].name,
            authors:authorlist
    })
}
}