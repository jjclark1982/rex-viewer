#!/usr/bin/env node

var express = require('express');

var app = express();

app.use(express.static('.'));

app.listen(8000, function(){
    console.log("HTTP server listening on port", this.address().port);
});
