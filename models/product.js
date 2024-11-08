 const mongoose = require('mongoose');
 const ProductSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        // parent:{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Category',
        // },
        starRate:{
            type: Number,
            required: true
        },
        rateComment:{
            type: Number,
            required: true
        },
        liked:{
            type: Number,
            required: true
        },
        quantity:{
            type: Number,
            required: true
        },
        author:{
            type: String,
            required: true
        },
        language:{
            type: String,
            required: true
        },
        typePaper:{
            type: String,
            required: true
        },
        numPage:{
            type: Number,
            required: true
        },
        publisher:{
            type: String,
            required: true
        },
        yearPublish:{
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        image: {
            type: String
        },
        deleted:{
            type: Boolean,
            default: false
        },
        status:{
            type: String,
            default: "active"
        }
 })
    const Product = mongoose.model('Product', ProductSchema,"products");
    module.exports = Product;