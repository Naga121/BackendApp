const User = require('../models/register');



// Get all users
exports.get_all_users= async (req, res, next) => {
    await User.find().select('_id username dateOfBirth profilePic email ').exec().then((result) => {
        const data = {
            count: result.length,
            users: result.map(user => {
                return {
                    _id: user._id, name: user.username, dateOfBirth: user.dateOfBirth, email: user.email, profilePic: user.profilePic,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/api/getuser/' + user.email
                    }
                }
            })
        }
        if (!result) {
            res.status(404).json({ status: 'error', message: 'All users list not found' });
        } else {
            res.status(200).json({ status: 'success', message: "All users details was getting", payload: data });
        }
    }).catch((err) => {
        res.status(500).json({ status: 'error', message: 'An error occurred while getting  users all details!', error: err });
    });
}

// Get single user details
exports.get_single_user = async (req, res, next) => {
    await User.findOne({ email: req.params.email }).select('_id username email active').exec().then((result) => {
        if (!result) {
            res.status(404).json({ status: 'error', message: 'User details not found' });
        } else {
            res.status(200).json({ status: 'success', message: "Gettting single user details", payload: result });
        }
    }).catch((err) => {
        res.status(500).json({ status: 'error', message: 'An error occurred while getting single user details!', error: err });
    });
}

// Update Single user details 
exports.update_single_user = async (req, res, next) => {
    const email=req.params.email;
    const updateOps={};
    for (const ops of req.body) {
        updateOps[ops.propName]=ops.value;
    }
    await User.updateOne({email:email},{$set:updateOps}).exec().then((result) => { 
        if (result) {
            res.status(200).json({ status:'success', message: 'User deteils updated successful',
                data:{
                    type:'GET',
                    url:'http://localhost:3000/api/getallusers/'
                }
            });
        } else {
            res.status(404).json({ status:'error', data: result, message: 'Cleaning Product with product name failed!'});
        }
    }).catch((err) => {
        res.status(500).json({ status: 'error', message: 'An error occurred while getting single user details!', error: err });
    });
}

// Delete single user
exports.delete_single_user = async (req, res, next) => {
    await User.findOneAndRemove({ email: req.params.email }).select('_id email').exec().then((result) => {
        if (!result) {
            res.status(404).json({ status: 'error', message: "User email not exist!" });
        } else {
            res.status(200).json({ status: 'success', message: 'User has been successfully deleted', payload: result })
        }
    }).catch((err) => {
        res.status(500).json({ status: 'error', message: 'An error occurred while deleting user!', error: err });
    });
}

