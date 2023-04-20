const Products = require('../models/product');
const Orders = require('../models/orders');
const mongoose = require('mongoose');

// Get Orders
exports.orders_get_all = async (req, res, next) => {
    await Orders.find().select('_id product quantity').exec().then((result) => {
        res.status(200).json({ status:'success', message: 'Oreders were fetched', 
            data:{
                count:result.length,
                orders:result.map(doc =>{
                    return {
                        _id:doc._id,
                        product:doc.product,
                        quantity:doc.quantity,
                        request:{
                            type:'GET',
                            url:`http://localhost:3000/api/orders/${doc._id}`
                        }
                    }  
                })
            }
        });
    }).catch((err) => {
        res.status(500).json({ status:'error', message: 'An error occurred while gettign Orders',error:err}); 
    });
}

// Post Order
exports.orders_post = async (req, res, next) => {
    await Products.findById(req.body.productId)
    .then(result => { 
        if (!result) {
            res.status(404).json({ status:'error', message: 'Product not found'}); 
        }
        const order = new Orders({ 
            _id:new mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        });
        return order.save();
    }).then(result => {
        res.status(201).json({ status: 'success', message: 'Oreder was stored',
            data:{
                _id:result._id,
                product:result.product,
                quantity:result.quantity
            }, 
            request: {
                type:'GET',
                url:`http://localhost:3000/api/orders/${result._id}`
            }
        });
    }).catch((err) => {
        res.status(500).json({ status:'error', message: 'An error occurred while adding Order',error:err});
    });
}

// Get Single order
exports.orders_get_single = async (req, res, next) => { 
    await Orders.findById(req.params.orderId).select(' _id product quantity').exec().then(result => {
        if (!result) {
            res.status(404).json({message:"Order not found"})
        }
        res.status(200).json({
            status:'success', message:'Single oreder was fetched',
            order:result,
            request: {
                type:'GET',
                url:`http://localhost:3000/api/orders`
            }
        })
    }).catch((err) => {
        res.status(500).json({ status:'error', message: 'An error occurred while fetching single Order',error:err});
    });
}

// Delete Selected Ordes
exports.orders_delete_single = async (req, res, next) => {
    let id = req.params.orderId; 
    await Orders.deleteOne({_id:id}).exec().then((result) => { 
        if ( result >=0){
            res.status(404).json({ status:'error', message: 'Cleaning orders not found!',data: result,});
        } else {
            res.status(200).json({ status:'success', message: 'Orders deleted successful',date:{
                type:'POST',
                url:'http://localhost:3000/api/orders/', 
            }});
        }
    }).catch((err) => {
        console.log(err);
        res.status(500).json({ status:'error', data:err, message: 'An error occurred while removeing the order.'});
    });
}