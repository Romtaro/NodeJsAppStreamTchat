const express = require('express')
var path = require('path')
const app = express()
const server = require('http').createServer(app)
let bodyParser = require('body-parser')
let session = require('express-session')


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
const io = require('socket.io')(server);

io.on('connection', function(socket){

    console.log('Client connected...');

    socket.on('join', function(data) {
        console.log(data);
        io.emit('pseudo message', 'Hello client !');
    });

    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });

});

server.listen(8080);
console.log("Listening on host : localhost:8080")

