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
    console.log(req.body)
    const exit = await Product.findOne({name:req.body.name})
    if (exit){
        res.render('admin/page/product/create',{
            error:"Product is already exist"
        })
    }
    else{
    let product = new Product(req.body);
    
    product.deleted = false;
    product.starRate = 0;
    product.rateComment = 0;
    product.liked = 0;
    await product.save()
    res.redirect('/admin/product')
}
}