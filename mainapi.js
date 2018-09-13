const express = require('express');
const morgan = require('morgan');
const app = express();
const http = require('http').Server(app);
// const io = require('socket.io')(http, { serveClient: false });
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const port = 55555;

// mongoose.connect('mongodb://127.0.0.1:27017/cryptohunt', { useNewUrlParser: true });

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.options('*', cors());

// app.use('/api/users', require('./routes/users'));
// const socketIO = require('./controllers/socketIO')(io);

 var server = http.listen(port, function() {
    console.log('Crypto Hunt Server is running on port '+port+' at '+new Date());
});


