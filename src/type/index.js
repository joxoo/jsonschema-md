var enumeration = require('./enum');
var pattern = require('./pattern');

module.exports = function( item ) {
    var type = enumeration(item) || pattern(item);
    return type;
};