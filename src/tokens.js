'use strict';

var _ = require('lodash');

function token() {
    this.tokens = {};
}

token.prototype.addToToken = function (tokenName, key, value) {
    var token = this.getToken(tokenName);

    if (!token[key]) {
        token[key] = value;
        return this;
    }
    if (token[key] === value) {
        return this;
    }
    if (typeof value === 'object') {
        if (value.length) {
            token[key] = token[key].concat(value);
        } else {
            token[key] = _.assign(token[key], value);
        }
        return this;
    }
    token[key] += value;
    return this;
};

token.prototype.hasToken = function (token) {
    return Boolean(this.tokens[token]);
};

token.prototype.getToken = function (token) {
    if (!this.hasToken(token)) {
        this.tokens[token] = {};
    }
    return this.tokens[token];
};

token.prototype.getTokens = function() {
    return this.tokens;
};

module.exports = new token();