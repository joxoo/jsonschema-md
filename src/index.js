#!/usr/bin/env node

var file = process.argv[2];
var parser = require('./parser');

if(!file) {
    console.error('No json schema file specified');
    process.exit()
}

try {
    var schema = parser(file);
        schema.parse();

} catch(e) {
    console.error(e)
    process.exit()
}