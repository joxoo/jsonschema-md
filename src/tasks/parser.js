'use strict';
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const type = require('../type');
const objectAssign = require('object-assign');

function Parser(file, tokens) {
  this.tokens = tokens;
  this.path = path.dirname(path.resolve(file));
  this.json = JSON.parse(fs.readFileSync(file, 'utf8'));
}

objectAssign(Parser.prototype, {

  _loadReferencesForItem(item) {
    let ref;
    let json;

    if (item.$ref) {
      ref = path.resolve(this.path, `${item.$ref.replace('#/', '')}.json`);
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
  },

  _parseRequired(tokenName, required, oneOf, anyOf) {
    const self = this;
    if (required) {
      self.tokens.addToToken(tokenName, 'required', required);
    }
    if (oneOf) {
      _.forIn(oneOf, (value) => {
        if (value.required) {
          self.tokens.addToToken(tokenName, 'requiredOneOf', value.required);
        }
      });
    }
    if (anyOf) {
      _.forIn(anyOf, (value) => {
        if (value.required) {
          self.tokens.addToToken(tokenName, 'requiredAnyOf', value.required);
        }
      });
    }
  },

  _parseProperties(tokenName, properties) {
    const subProps = {};
    const self = this;
    _.forIn(properties, (value, key) => {
      value = self._loadReferencesForItem(value);
      if (value.type === 'object') {
        subProps[key] = value;
      }
      if (value.items) {
        subProps[`${key}:${value.items.title}`] = value.items;
      }
      self.tokens.addToToken(tokenName, `props:${key}`, {
        name: key,
        type: value.type,
        description: value.description,
        allowed: type(value),
        example: value.example
      });
    });
    this._parseSubProps(subProps);
  },

  _parseSubProps(subProps) {
    const self = this;

    _.forIn(subProps, (json, key) => {
      const tokenName = key;
      self.tokens.addToToken(tokenName, 'title', json.title);
      self.tokens.addToToken(tokenName, 'description', json.description);
      self.tokens.addToToken(tokenName, 'type', json.type);
      self.tokens.addToToken(tokenName, 'allowed', type(json));

      if (json.properties) {
        self._parseProperties(tokenName, json.properties);
        self._parseRequired(tokenName, json.required, json.oneOf, json.anyOf);
      }
    });
  },

  _parse(json) {
    const tokenName = json.id || 'default';
    this.tokens.addToToken(tokenName, 'title', json.title);
    this.tokens.addToToken(tokenName, 'description', json.description);
    if (typeof json.type === 'string') {
      this.tokens.addToToken(tokenName, 'type', json.type);
    }

    if (json.properties) {
      this._parseProperties(tokenName, json.properties);
    }
  },

  parse(callback) {
    try {
      this._parse(this.json);
      callback();
    } catch (e) {
      callback(e);
    }
  }
});

module.exports = (file, tokens) => {
  return new Parser(file, tokens);
};
