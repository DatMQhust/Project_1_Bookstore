const Product = require('../../models/product');
const search = require('../../helpers/search');
const pageHelper = require('../../helpers/pagination');
module.exports.index = async (req,res) =>{
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
    res.render('client/page/home/index',{
        products:product,
        totalPage: totalPage,
        currentPage: page
    })
    
}