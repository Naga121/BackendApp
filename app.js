const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongooes = require('mongoose');
const passport = require('passport'); 
const events=require('events');


const oAuth = require('./routes/oAuth');
const userRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const cronJobs =require('./cron-jobs/batch-jobs')


// MongoDB Connection //
mongooes.connect( 'mongodb+srv://nodeTest:nodeTest@cluster1.z2mw4kv.mongodb.net/?retryWrites=true&w=majority', { useUnifiedTopology: true, useNewUrlParser: true }).then(() => { 
    console.log("DB Connected...") 
}).catch(err => { 
    console.log(err) 
});
mongooes.Promise=global.Promise;

// connections
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(cors({ origin: "*" }));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(passport.initialize());
// app.use(passport.session());


// CORS Origin
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-type, Accept, Authoriuzation');
    if (req.method === 'OPTION') {
        res.header('Access-Control-Allow-Method', 'PUT, POST, PATCH, DELECT, GET');
        return res.status(200).json({})
    }
    next();
});

// Routes handles request
app.use('/api', oAuth);
app.use('/api/users', userRouter)
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
// cronJobs.sendMailAllUser();
// Error Handling
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404
    next(error)
});
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({ error: { message: error.message } })
});

module.exports = app;

