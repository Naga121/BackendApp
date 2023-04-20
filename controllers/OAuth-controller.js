const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

// secure key for jwt middlware
const secretKey = 'jwtSecret';

const transporter=require('../middlewares/nodemailer');
 
const User = require('../models/register');
const UserVerification = require('../models/userVerification');
const PasswordReset = require('../models/passwordRest');

// Add new user
exports.add_new_user = async (req, res, next) => {
    if ({ username: req.body.username } == ''|| { fullName: req.body.fullName } == '' || { dateOfBirth: req.body.dateOfBirth } == '' || { email: req.body.email } == '' || { password: req.body.password } == '' || { confirmpassword: req.body.confirmpassword } == '') {
        res.json({ status: 'error', message: 'Emty input fields' });
    } else if (!/^[a-zA-Z]*$/.test(req.body.username)) {
        res.json({ status: 'error', message: 'Invalid name entered' });
    } else if (!/^[a-zA-Z\s]+$/.test(req.body.fullName)) {
        res.json({ status: 'error', message: 'Invalid name entered' });
    } else if (new Date(req.body.dateOfBirth).getTime()) {
        res.json({ status: 'error', message: 'Invalid Date of birth entered' });
    } else if (!/^[\w-\.]+@([\w-\.]+\.)+[\w-]{2,4}$/.test(req.body.email)) {
        res.json({ status: 'error', message: 'Invalid email entered' });
    } else if (req.body.password.length < 8) {
        res.json({ status: 'error', message: 'Password is short!' });
    } else if (req.body.confirmpassword !== req.body.password) {
        res.json({ status: 'error', message: 'Confirm Password is not match!' });
    } else {
        const { email } = req.body;
        await User.findOne({ email }).exec().then(existUser => {
            if (existUser) {
                res.status(409).json({ status: 'error', message: 'User email already exist!', data: { email: existUser.email } });
            } else {
                bcrypt.hash(req.body.password, 10).then(hashedPwd => {
                    const newUser = new User({
                        _id: new mongoose.Types.ObjectId(),
                        username: req.body.username,
                        fullName: req.body.fullName,
                        email: req.body.email,
                        dateOfBirth: req.body.dateOfBirth,
                        profilePic: req.file.path,
                        password: hashedPwd,
                        active: true,
                        verified: false
                    });
                    newUser.save().then(response => {
                        sendVerificationEmail(response, res);
                        // res.status(201).json({ status: 'success', message: 'Registration successfully created', data: response });
                    }).catch((err) => {
                        console.log(err);
                        res.status(500).json({ status: 'error', message: 'An error occurred while hashing password!', error: err });
                    })
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({ status: 'error', message: 'An error occurred while hashing password!', error: err });
                });
            }
        }).catch((err) => {
            console.log(err);
            res.status(500).json({ status: 'error', message: 'An error occurred while checking for existing user email!', error: err });
        });
    }
}

// Send  verification email
const sendVerificationEmail = async (data, res) => {
    // url to be used in the email
    const createUrl = "http://localhost:3000/api/";
    const uuidString = uuidv4() + data._id;
    // mail options 
    const mailOptions = {
        form: "github.naga@gmail.com",
        to: data.email,
        subject: 'Verify Your Email',
        html: `  <!doctype html>
                <html lang="en">
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1"> 
                      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ" crossorigin="anonymous">
                    </head>
                    <body>
                      <div class="card" style="width: 18rem;">
                          <div class="card-body">
                              <h5 class="card-title">Hello ${data.fullName}</h5>
                              <p class="card-text">Verifi your email adress to complete the registration and login into your account.</p>
                              <p class="card-text">This link will be <b>expires in 6 hours</b>.</P>
                              <a class="btn btn-primary" href=${createUrl + "verify/" + data._id + "/" + uuidString} >Click here</a>
                          </div>
                      </div>
                      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ENjdO4Dr2bkBIFxQpeoTz1HIcje39Wm4jDKdf19U8gI4ddQ3GYNS7NTKfAdVQSZe" crossorigin="anonymous"></script>
                    </body>
                </html>`
    };
    // Hash the uniqueString
    await bcrypt.hash(uuidString, 10).then(hashedUniqueString => {
        // set values in user verification collection
        const newVerification = new UserVerification({ userId: data._id, uniqueString: hashedUniqueString, createdAt: Date.now(), expiresAt: Date.now() + 120000 });
        newVerification.save().then(() => {
            transporter.sendMail(mailOptions).then(() => {
                // email sent and verification record saved
                res.status(200).json({ status: 'pending', message: 'Verification link sent to your register email' });
            }).catch(error => {
                console.log(error);
                res.status(500).json({ status: 'error', message: 'Verification email process faild!', error: err });
            });
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 'error', message: "Couldn't save verification email data!", error: err });
        });
    }).catch(error => {
        console.log(error);
        res.status(500).json({ status: 'error', message: 'An error occurred while hashing email data!', error: err });
    });
}

// verify email
exports.email_verify = async (req, res, next) => {
    const { userId, uniqueString } = req.params;
    await UserVerification.find({ userId }).then((response) => {
        if (response.length > 0) {
            // user verification record exist so we proceed 
            const { expiresAt } = response[0];
            const hashedUniqueString = response[0].uniqueString;
            // checking has expired unique string 
            if (expiresAt < Date.now()) {
                // record has expire so we delete it 
                UserVerification.deleteOne({ userId }).then(() => {
                    User.deleteOne({ _id: userId }).then(() => {
                        let message = "Link has expired. Please Register again.";
                        res.redirect(`/verified/error=true&message=${message}`);
                    }).catch(error => {
                        console.log(error);
                        let message = "Cleaning user with expiried unique string failed";
                        res.redirect(`/error=true&message=${message}`);
                    });
                }).catch(error => {
                    console.log(error);
                    let message = "An error occurred while clearing expire user verification recoed.";
                    res.redirect(`/error=true&message=${message}`);
                });
            } else {
                // validate record exists so we validate the user
                // first compare the unique string    
                bcrypt.compare(uniqueString, hashedUniqueString).then(response => {
                    if (response) {
                        // unique string match and update verification status 
                        User.updateOne({ _id: userId }, { verified: true }).then(() => {
                            UserVerification.deleteOne({ userId }).then(() => {
                                res.sendFile(path.join(__dirname, './../views/verified.html'));
                            }).catch(error => {
                                console.log(error);
                                let message = "An error occurred while finalizig successful verification.";
                                res.redirect(`/error=true&message=${message}`);
                            });
                        }).catch(error => {
                            let message = "An error occurred while updating user record to show verified.";
                            res.redirect(`/error=true&message=${message}`);
                        });
                    } else {
                        // existed record but incorrect verification details passed
                        let message = "Incorrect verification details passed, Check your inbox.";
                        res.redirect(`/error=true&message=${message}`);
                    }
                }).catch(error => {
                    console.log(error);
                    let message = "An error occurred while comparing unique strings.";
                    res.redirect(`/api/verified/error=true&message=${message}`);
                });
            }
        } else {
            // user verification  record doesn't exist
            let message = "Account record doesn't exit or has been verified already, Please Register or Login.";
            res.redirect(`/api/verified/error=${true}&message=${message}`)
        }
    }).catch(error => {
        console.log(error);
        let message = "An error occurred while checking for  user verification record.";
        res.redirect(`/api/verified/error=${true}&message=${message}`);
    });
}

// verify screen
exports.verify_screen = async (req, res, next) => {
    res.sendFile(path.join(__dirname, "./../views/verified.html"));
}

// User Login
exports.user_login = async (req, res, next) => {
    const { email, password } = req.body;
    if (email == '' || password == '') {
        res.json({ status: 'error', message: 'Emty input fields!' });
    } else if (!/^[\w-\.]+@([\w-\.]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({ status: 'error', message: 'Invalid email entered!' });
    } else if (password.length < 8) {
        res.json({ status: 'error', message: 'Password is short!' });
    } else {
        await User.findOne({ email }).then(existUser => {
            if (!existUser) {
                // check if user email exist or not
                res.status(401).json({ status: 'error', message: "Your email not found, user doesn\'t exist..!" });
            } else {
                // check if user is verified or not 
                if (!existUser.verified) {
                    res.status(409).json({
                        status: 'error', message: "Your email hasn't been verified yet,Please check your register email inbox or span",
                        payload: { email: existUser.email }
                    });
                } else if (!existUser.active) {
                    // check if user email is active or not
                    res.status(409).json({ status: 'error', message: "The user email id was Inactive,Please contact your administator!" });
                } else {
                    // User compare hashedPasswoed
                    bcrypt.compare(password, existUser.password).then(response => {
                        if (response) {
                            jwt.sign({ _id: existUser._id, username: existUser.username, fullName: existUser.fullName, email: existUser.email, active: existUser.active }, secretKey, { expiresIn: "1h" }, (err, token) => {
                                if (err) throw err;
                                res.status(200).json({
                                    status: 'success', message: 'User login successful',
                                    token: token,
                                    payload: {
                                        _id: existUser._id, username: existUser.username, fullName: existUser.fullName, email: existUser.email, dateOfBirth: existUser.dateOfBirth, active: existUser.active
                                    }
                                });
                            });
                        } else {
                            res.status(401).json({ status: 'error', message: "Invalid user password!", error: err });
                        }
                    });
                }
            }
        }).catch(err => {
            res.status(500).json({ status: 'error', message: "An error occurred while comparing password!", error: err });
        });
    }
}

// Password reset
exports.request_password_reset = async (req, res, next) => {
    const { email, redirectUrl } = req.body;
    // checking if email exist or not
    User.findOne({ email }).then(data => {
        if (data) {
            // user email exists
            // check if user is verified
            if (!data.verified) {
                res.json({ status: 'error', message: "Email hasn't been verified yet, check your inbox!" });
            } else {
                // proceed with email to resert password
                sendPasswordResetEmail(data, redirectUrl, res);
            }
        } else {
            res.json({ status: 'error', message: 'No account with the supplied email existe!' });
        }
    }).catch(error => {
        console.log(error);
        res.json({ status: 'error', message: 'An error occurred while checking for  existing user!' });
    })
}

// send password reset email
const sendPasswordResetEmail = ({ _id, email }, redirectUrl, res) => {
    const resetString = uuidv4() + _id;
    // First, we clear all existing reset record
    passwordReset.deleteMany({ userId: _id }).then(data => {
        // Reset record deleted successfully
        // No we send the email
        // mail options
        const mailOptions = {
            form: process.env.AUTH_EMAIL,
            to: email,
            subject: 'Password Reset',
            html: `<p>We headr that you lost the password.</p> <p>Don't worry, use the link  below to reset it.</p>
                    <p>This link <b>expires 60 minuts</b>.</p>
                    <p>Press  <a href=${redirectUrl + "/" + _id + "/" + resetString}>here</a> to proceed.</p> `
        };
        // hash the reset string
        bcrypt.hash(resetString, 10).then(hashedResetString => {
            // set values in password reset collection
            const newPasswordReset = new PasswordReset({ userId: _id, resetString: hashedResetString, createdAt: Data.now(), expiresAt: Date.now() + 3600000 });
            newPasswordReset.save().then(() => {
                transporter.sendMail(mailOptions).then(() => {
                    // Reset email sent and password reset record saved
                    res.json({ status: 'Pending', message: "Password reset request email sent", })
                }).catch(error => {
                    console.log(error);
                    res.json({ status: 'error', message: "Password reset email failed" });
                })
            }).catch(error => {
                console.log(error);
                res.json({ status: 'error', message: "Couldn't save passwoed reset data!" });
            })
        }).catch(error => {
            console.log(error);
            res.json({ status: 'error', message: 'An error occurred while hashing the reset data!' });
        });
    }).catch(error => {
        console.log(error);
        res.json({ status: 'error', message: 'Cleaning existing password reset record failed' });
    })
}

// Password reset
exports.password_reset = async (req, res, next) => {
    let { userId, resetString, newPassword } = req.body;
    await PasswordReset.find({ userId }).then(response => {
        if (response.length > 0) {
            // Password reset record exist so we proceed
            const { expiresAt } = response;
            const hashedResetString = response.resetString;
            // checking for expired reset string
            if (expiresAt < Date.now()) {
                PasswordReset.deleteOne({ userId }).then(() => {
                    // Reset record deleted successfully
                    res.json({ status: 'error', message: 'Password reset link has expired' });
                }).catch(error => {
                    // Deletion faild
                    console.log(error);
                    res.json({ status: 'error', message: 'Cleaning password reset record faild' });
                });
            } else {
                // Valid reset record exist so we validate the reset string
                // First compare the hashed reset string
                bcrypt.compare(resetString, hashedResetString).then((response) => {
                    if (response) {
                        // String matched 
                        // hash password  again 
                        bcrypt.hash(newPassword, 10).then((hashedNewPasswoed) => {
                            // Update user password
                            User.updateOne({ _id: userId }, { password: hashedNewPasswoed }).then(() => {
                                // update complete, Now delete reset record
                                PasswordReset.deleteOne({ userId }).then(() => {
                                    // both user record and  reset record updated
                                    res.json({ status: 'success', message: 'Password has been reset successfully.' });
                                }).catch(error => {
                                    console.log(error);
                                    res.json({ status: 'error', message: 'An error occurred while finalizing password reset.' });
                                });
                            }).catch(error => {
                                console.log(error);
                                res.json({ status: 'error', message: 'Updateing user password fails.' });
                            });
                        }).catch(error => {
                            console.log(error);
                            res.json({ status: 'error', message: 'An error occurred while hashing new password!' });
                        });
                    } else {
                        // Existing record but incarrect reset string passed
                        res.json({ status: 'error', message: 'Invalid password reset details passed' });
                    }
                }).catch(error => {
                    console.log(error);
                    res.json({ status: 'error', message: 'Comparing password reset string failed' });
                });
            }
        } else {
            // Password reset record doesn't exist
            res.json({ status: 'error', message: 'Password reset request not found' });
        }
    }).catch(error => {
        console.log(error);
        res.json({ status: 'error', message: 'Chicking for existing password reset record faild' });
    });
}