var fs  = require('fs');
var path = require('path');
var _  = require('lodash');
var type = require('./type');

function parser( file ) {
    this.path = path.dirname(path.resolve(file));
    this.json = JSON.parse(fs.readFileSync(file, 'utf8'));
}

parser.prototype._loadReferencesForItem = function (item) {
    var ref, json;

    if (item.$ref) {
        ref = path.resolve(this.path, item.$ref.replace("#/", "") + '.json');
        json = JSON.parse(fs.readFileSync(ref, 'utf8'));
        if (json.items) {
            json.items = this._loadReferencesForItem(json.items);
        }
        return json;
    }

    if (item.items) {
        item.items = this._loadReferencesForItem(item.items);
    }
    return item;
};

parser.prototype._getDescription = function(item, key) {
    var typeDesc = type.enum(item);

    if (item.type === 'object') {
        return '[Description...](#' + key.toLowerCase() + ')';
    }

    if(item.items && item.items.type === 'object') {
        return '[Description...](#' + key.toLowerCase() + ')';
    }

    if (typeDesc) {
        return (item.description? item.description.trim() + '<br>' + typeDesc: typeDesc);
    }
    return item.description || '';
};

parser.prototype._getName = function(item, key) {
    if (item.type === 'object') {
        return '[' + key + '](#' + key.toLowerCase() + ')';
    }

    if(item.items && item.items.type === 'object') {
        return '[' + key + '](#' + key.toLowerCase() + ')';
    }

    return key;
};

parser.prototype._parseProperties = function (properties, required, tokens) {
    var subProps = {}, self = this;
    tokens.push('| Name    | Type    | Description | Example |');
    tokens.push('| ------- | ------- | ----------- | ------- |');
    _.forIn(properties, function ( value, key ) {
        var value = self._loadReferencesForItem(value),
            description = self._getDescription(value, key),
            name = self._getName(value, key);

        if (value.type === 'object') {
            subProps[key] = value;
        }

        if(value.items && value.items.type === 'object') {
            subProps[key + ':' + value.items.title] = value.items;
        }
        tokens.push('| ' + name + ' | ' + value.type + ' | ' + description + ' | ' + value.example + ' |')
    });
    this._parseSubProps(subProps, tokens);
};

parser.prototype._parseSubProps = function(subProps, tokens) {
    var self = this;
    _.forIn(subProps, function ( json, key ) {
        tokens.push('', '###' + key);
        if(json.description) {
            tokens.push('__' + json.description.trim() + '__');
        }
        tokens.push('', '#####Type:' + json.type, '');


        if (json.properties) {
            self._parseProperties(json.properties, (json.required || json.oneOf || json.anyOf), tokens);
        }
    });
};

parser.prototype._parse = function(json, tokens) {
    _.forIn(json, function ( value, key ) {
        switch(key) {
            case 'title':
                tokens.push('##' + value);
                break;
            case 'description':
                tokens.push('__' + value + '__');
                tokens.push('');
                break;
            case 'type':
                tokens.push("###Type: " + value);
                tokens.push('');

        }
    });
    if (json.properties) {
        this._parseProperties(json.properties, (json.required || json.oneOf || json.anyOf), tokens);
    }
};

parser.prototype.parse = function () {
    var tokens = [];

    this._parse(this.json, tokens);

    console.log(tokens.join("\n"));
};

module.exports = function( file ) {
    return new parser(file);
};
