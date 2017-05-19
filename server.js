var express = require('express')
var path = require('path')
var app = express()
var server = require('http').createServer(app)
let bodyParser = require('body-parser')
let session = require('express-session')
var port = 8080

process.env.NODE_ENV="production";

// Moteur de template
app.set('view engine', 'ejs')

// Middleware
app.use(express.static(path.join(__dirname, 'www')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
    secret: 'aazeazeeaz',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))
app.use(require('./middlewares/flash'))

// Routes
app.get('/', (request, response) => {
    let Message = require('./models/message')
    Message.all(function (messages) {
    response.render('pages/index', {messages: messages})
})
})

app.post('/', (request, response) => {
    if (request.body.message === undefined || request.body.message === '') {
    request.flash('error', "Vous n'avez pas posté de message")
    response.redirect('/')
} else {
    let Message = require('./models/message')
    Message.create(request.body.message, function () {
        request.flash('success', "Merci !")
        response.redirect('/')
    })
}
})

app.get('/message/:id', (request, response) => {
    let Message = require('./models/message')
    Message.find(request.params.id, function (message) {
    response.render('messages/show', {message: message})
})
})


// Chargement de socket.io
var io = require('socket.io').listen(server);

io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('join', function(data) {
        console.log(data);
        client.emit('messages', 'Hello from server');
    });

});

app.listen(port)
console.log("Listening on host : localhost")
console.log("Listening on port " + port);
