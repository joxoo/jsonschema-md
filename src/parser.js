var fs  = require('fs');
var path = require('path');
var _  = require('lodash');
var type = require('./type');

function parser( file, tokens ) {
    this.tokens = tokens;
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

parser.prototype._parseRequired = function (tokenName, required, oneOf, anyOf) {
    var self = this;
    if (required) {
        self.tokens.addToToken(tokenName, 'required', required);
    }
    if (oneOf) {
        _.forIn(oneOf, function ( value ) {
            if (value.required) {
                self.tokens.addToToken(tokenName, 'requiredOneOf', value.required);
            }
        });
    }
    if (anyOf) {
        _.forIn(anyOf, function ( value ) {
            if (value.required) {
                self.tokens.addToToken(tokenName, 'requiredAnyOf', value.required);
            }
        });
    }
};

parser.prototype._parseProperties = function (tokenName, properties) {
    var subProps = {}, self = this;
    _.forIn(properties, function ( value, key ) {
        var value = self._loadReferencesForItem(value);

        if (value.type === 'object') {

            subProps[key] = value;
        }

        if(value.items) {
            subProps[key + ':' + value.items.title] = value.items;
        }
        self.tokens.addToToken(tokenName, 'props:' + key, {
            'name': key,
            'type': value.type,
            'description' : value.description,
            'allowed': type(value),
            'example': value.example})
    });
    this._parseSubProps(subProps);
};

parser.prototype._parseSubProps = function(subProps) {
    var self = this;

    _.forIn(subProps, function ( json, key ) {

        var tokenName = key;
        self.tokens.addToToken(tokenName, 'title', json.title);
        self.tokens.addToToken(tokenName, 'description', json.description);
        self.tokens.addToToken(tokenName, 'type', json.type);
        self.tokens.addToToken(tokenName, 'allowed', type(json));

        if (json.properties) {
            self._parseProperties(tokenName, json.properties);
            self._parseRequired(tokenName, json.required, json.oneOf, json.anyOf)
        }
    });
};

parser.prototype._parse = function(json) {
    var tokenName = json.id || 'default';
    this.tokens.addToToken(tokenName, 'title', json.title);
    this.tokens.addToToken(tokenName, 'description', json.description);
    if (typeof json.type === 'string' ) {
        this.tokens.addToToken(tokenName, 'type', json.type);
    }

    if (json.properties) {
        this._parseProperties(tokenName, json.properties);
    }
};

parser.prototype.parse = function ( callback ) {
    try {
        this._parse(this.json);
        callback();
    } catch (e) {
        callback(e)
    }

};

module.exports = function( file, tokens ) {
    return new parser(file, tokens);
};
