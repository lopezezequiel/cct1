var express = require('express');
var path = require('path');
var app = express();

app.use('/public', express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/sender', function (req, res) {
  res.sendFile(path.join(__dirname, 'sender.html'));
});

app.get('/sender2', function (req, res) {
  res.sendFile(path.join(__dirname, 'sender2.html'));
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!');
});
