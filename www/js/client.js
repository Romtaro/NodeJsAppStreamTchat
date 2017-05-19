/**
 * Created by Draden on 19/05/2017.
 */
var express = require('express');
var app = express();
var server = require('http').createServer(app);
const io = require('socket.io').listen(server);
