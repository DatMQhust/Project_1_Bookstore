const Product = require('../../models/product')
const searchHelper = require('../../helpers/search');
const pageHelper = require('../../helpers/pagination');
const search = require('../../helpers/search');
// [GET] /admin/product
module.exports.index = async (req,res)=>{
    let finds ={
        deleted : false
    };
    const regex = search(req.query)
    if (req.query.search){
        finds.name = regex
    }
    
    const count = await Product.countDocuments(finds)
    const {page,limit,offset,totalPage} = pageHelper(req.query,count)
    const product = await Product.find(finds).limit(limit).skip(offset)
    //console.log(product)
    res.render('admin/page/product/index',{
        products:product,
        totalPage: totalPage,
        currentPage: page
    })
}

// [DELETE] /admin/product/delete/:id
module.exports.delete = async (req,res)=>{
    const id = req.params.id;
    await Product.updateOne({ _id: { $in: id } }, { deleted: true })
    res.redirect('back')
}

// [GET] /admin/product/create
module.exports.create = (req,res)=>{
    res.render('admin/page/product/create')
}
module.exports.createPost = async (req,res)=>{
    
    const exit = await Product.findOne({name:req.body.name})
    if (exit){
        res.render('admin/page/product/create',{
            error:"Product is already exist"
        })
    }
    else{
        if(req.file){
            req.body.image = `/uploads/${req.file.filename}`
        }
    let product = new Product(req.body);
    
    product.deleted = false;
    product.starRate = 0;
    product.rateComment = 0;
    product.liked = 0;
    await product.save()
    res.redirect('/admin/product')
}
}
// [GET] /admin/product/edit/:id
module.exports.edit = async (req,res)=>{
    const id = req.params.id;
    const product = await Product.findById(id)
    res.render('admin/page/product/edit',{
        product:product
    })
}
// [POST] /admin/product/edit/:id
module.exports.editPost = async (req,res)=>{
    const id = req.params.id;
    req.body.quantity = parseInt(req.body.quantity)
    req.body.price = parseInt(req.body.price)
    req.body.numPage = parseInt(req.body.numPage)
    req.body.yearPublish = parseInt(req.body.yearPublish)
    if(req.file){
        req.body.image = `/uploads/${req.file.filename}`
    }
    await Product.updateOne({ _id: { $in: id } }, req.body)
    res.redirect('/admin/product')
}