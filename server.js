let express = require('express')
var path = require('path')
let app = express()
var server = require('http').createServer(app)
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
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket, pseudo) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        socket.broadcast.emit('nouveau_client', pseudo);
    });

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('message', function (message) {
        message = ent.encode(message);
        socket.broadcast.emit('message', {pseudo: socket.pseudo, message: message});
    });
});

app.listen(8080)
