'use strict';

var _ = require('lodash');

function markdown(tokens) {
    this.tokens = tokens;
    this.lines = []
}

markdown.prototype.required = function (values, key) {
    this.lines.push('Required' + (key? ' ' + key: '') + ': ' + values.join(', '), '');
};

markdown.prototype.allowed= function (string, key) {
    this.lines.push('Allowed' + (key? ' ' + key: '') + ': ' + string, '');
};

markdown.prototype.anker= function (string) {
    return '[' + string + '](#' + string.toLowerCase() + ')';
};

markdown.prototype.headline = function (string, size) {
    var headline = new Array((size || 1) + 1).join('#');
    this.lines.push( headline + string, '');
};

markdown.prototype.description = function (string) {
    if (_.isArray(string)) {
        string = '* ' + string.join('\n* ');
    }
    var description = string || 'add description to json file';
    this.lines.push( '__' + description.trim() + '__', '');
};

markdown.prototype.table = function ( items ) {
    var self = this, allowed = {};
    this.lines.push('| Name    | Type    | Description | Example |');
    this.lines.push('| ------- | ------- | ----------- | ------- |');

    _.forIn(items, function(property, key) {
        var name = property.name,
            type = property.type,
            description = property.description || '',
            example = property.example || '';

        if (self.tokens.hasToken(property.name)) {
            name = self.anker(property.name);
        }

        if (property.allowed && !self.tokens.hasToken(name)) {
            allowed[name] = property.allowed;
        }
        self.lines.push('| ' + name + ' | ' + type + ' | ' + description + ' | ' + example + ' |')

    });

    _.forIn(allowed, function(property, key) {
        self.allowed(property, key);
    });
};

markdown.prototype.type = function (string) {
    this.headline('Type: ' + string, 4);
};

markdown.prototype.generate = function () {
    var self = this;
    _.forIn(this.tokens.getTokens(), function(item, key) {
        var table = [];
        if (key === 'default') {
            self.headline(item.title);
        } else {
            self.headline(key, 2);
        }
        self.type(item.type);
        self.description(item.description);

        if (item.required) {
            self.required(item.required)
        }
        if (item.requiredOneOf) {
            self.required(item.requiredOneOf, 'one of')
        }
        if (item.requiredAnyOf) {
            self.required(item.requiredAnyOf, 'any of')
        }
        if (item.allowed) {
            self.allowed(item.allowed);
        }

        _.forIn(item, function(property, key) {
           if( key.indexOf('props:') === 0) {
               table.push(property);
           } 
        });
        if (table.length) {
            self.table(table);
        }
        self.lines.push('', '*****', '');

    });
    return this.lines.join("\n");
};

module.exports = markdown;