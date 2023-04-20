const Product = require("../models/product");
const mongoose = require("mongoose");



// Get all products
exports.products_get_all = async (req, res, next) => { 
    await Product.find().select('_id name price discount productImage').exec().then((result) => {
        const response={
            count:result.length,
            products:result.map(doc=>{
                return {
                    _id:doc._id, name:doc.name, price:doc.price, discount:doc.discount, productImage:doc.productImage,
                    request:{
                        type:'GET',
                        url:'http://localhost:3000/api/products/'+ doc._id
                    }
                }
            }),
        }
        if (result.length >= 0) {
            console.log(result);
            res.status(200).json({ status:'success', data: response, message: 'Peoduct list are getting successful.'});
        } else {
            console.log(result);
            res.status(404).json({ status:'error', message: 'Peoduct List not found'});
        }
    }).catch((err) => {
        console.log(err);
        res.status(200).json({ status:'success', data: result, message: 'An error occurred while getting product.'});
    });
}

// Post product
exports.products_post = async (req, res, next) => {
    const {name}=req.body
    await Product.findOne({name}).exec().then(result => {
        if (result) {
            res.status(200).json({ status:'success', data: result, message: 'Peoduct name alreay exist, Add another Product.'});
        } else {
            const product=new  Product({ 
                _id:new mongoose.Types.ObjectId(), name:req.body.name, price:req.body.price, discount:req.body.discount, productImage:req.file.path
            });
            product.save().then((result) => { 
                res.status(201).json({ status:'success', 
                    message: 'Peoduct add successful.',
                    data: {
                        _id:result._id, name:result.name, price:result.price, discount:result.discount, productImage:result.productImage,
                        request:{
                            type:'GET',
                            url:'http://localhost:3000/api/products/'+result._id
                        }
                    }
                });
            }).catch((err) => {
                console.log(err);
                res.status(200).json({ status:'error', data: err, message: 'An error occurred while add new product!'});
            });
        }
    }).catch((err) => {
        console.log(err);
    });
    
}

// Get single product
exports.products_get_single = async (req, res, next) => {
    let id = req.params.productId;
    await Product.findById(id).select('_id name price discount productImage').exec().then((result) => {
        const response={ 
            products:result,
            request:{
                type:'GET',
                url:'http://localhost:3000/api/products/'+result._id
            } 
        }
        if (result) {
            res.status(200).json({ status:'success', data: response, message: 'Get single Product Id'});
        } else {
            res.status(400).json({ status:'error', message: 'No valid entry  for provide ID'});
        }
    }).catch((err) => {
        console.log(err);
        res.status(500).json({ status:'error', data:err, message: 'Server side error'});
    });
}

// Update single product
exports.products_update_single = async (req, res, next) => {
    const id=req.params.productId;
    const updateOps={};
    for (const ops of req.body) {
        updateOps[ops.propName]=ops.value;
    }
    await Product.updateOne({_id:id},{$set:updateOps}).exec().then((result) => {
        if (result) {
            res.status(200).json({ status:'success', message: 'Product Updated successful',
                data:{
                    type:'GET',
                    url:'http://localhost:3000/api/products/'+id
                }
            });
        } else {
            res.status(404).json({ status:'error', data: result, message: 'Cleaning Product with product name failed!'});
        }
    }).catch((err) => {
        console.log(err);
        res.status(500).json({ status:'error', data:err, message: 'An error occurred while update the product.'});
    });
}

// Delete single product
exports.products_delete_single = async (req, res, next) => {
    let id = req.params.productId; 
    await Product.deleteOne({_id:id}).exec().then((result) => { 
        if ( result >=0){
            res.status(404).json({ status:'error', message: 'Cleaning Product not found!',data: result,});
        } else {
            res.status(200).json({ status:'success', message: 'Product deleted successful',date:{
                type:'POST',
                url:'http://localhost:3000/api/products/',
                body:{name:'String',price:'Number',discount:'Number',productImage:'String' }
            }});
        }
    }).catch((err) => {
        console.log(err);
        res.status(500).json({ status:'error', data:err, message: 'An error occurred while removeing the product.'});
    });
}