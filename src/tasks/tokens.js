'use strict';

const _ = require('lodash');
const objectAssign = require('object-assign');

function Token() {
  this.tokens = {};
}

objectAssign(Token.prototype, {
  addToToken(tokenName, key, value) {
    const token = this.getToken(tokenName);

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
  },

  hasToken(token) {
    return Boolean(this.tokens[token]);
  },

  getToken(token) {
    if (!this.hasToken(token)) {
      this.tokens[token] = {};
    }
    return this.tokens[token];
  },

  getTokens() {
    return this.tokens;
  }
});

module.exports = new Token();
