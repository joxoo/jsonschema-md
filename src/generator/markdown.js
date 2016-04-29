'use strict';

const _ = require('lodash');
const objectAssign = require('object-assign');

function Markdown(tokens) {
  this.tokens = tokens;
  this.lines = [];
}
objectAssign(Markdown.prototype, {
  required(values, key) {
    this.lines.push(`Required${key ? ` ${key}` : ''}: ${values.join(', ')}`, '');
  },

  allowed(string, key) {
    this.lines.push(`Allowed${key ? ` ${key}` : ''}: ${string}`, '');
  },

  anker(string) {
    return `[${string}](#${string.toLowerCase()})`;
  },

  headline(string, size) {
    const headline = new Array((size || 1) + 1).join('#');
    this.lines.push(headline + string, '');
  },

  description(string) {
    if (_.isArray(string)) {
      string = `*${string.join('\n* ')}`;
    }
    const description = string || 'add description to json file';
    this.lines.push(`__${description.trim()}__`, '');
  },

  table(items) {
    const self = this;
    const allowed = {};
    this.lines.push('| Name    | Type    | Description | Example |');
    this.lines.push('| ------- | ------- | ----------- | ------- |');

    _.forIn(items, (property) => {
      let name = property.name;
      const type = property.type;
      const description = property.description || '';
      const example = property.example || '';

      if (self.tokens.hasToken(property.name)) {
        name = self.anker(property.name);
      }

      if (property.allowed && !self.tokens.hasToken(name)) {
        allowed[name] = property.allowed;
      }
      self.lines.push(`| ${name} | ${type} | ${description} | ${example} |`);
    });

    _.forIn(allowed, (property, myKey) => {
      self.allowed(property, myKey);
    });
  },

  type(string) {
    this.headline(`Type: ${string}`, 4);
  },

  generate() {
    const self = this;
    _.forIn(this.tokens.getTokens(), (item, key) => {
      const table = [];
      if (key === 'default') {
        self.headline(item.title);
      } else {
        self.headline(key, 2);
      }
      self.type(item.type);
      self.description(item.description);

      if (item.required) {
        self.required(item.required);
      }
      if (item.requiredOneOf) {
        self.required(item.requiredOneOf, 'one of');
      }
      if (item.requiredAnyOf) {
        self.required(item.requiredAnyOf, 'any of');
      }
      if (item.allowed) {
        self.allowed(item.allowed);
      }

      _.forIn(item, (property, tKey) => {
        if (tKey.indexOf('props:') === 0) {
          table.push(property);
        }
      });
      if (table.length) {
        self.table(table);
      }
      self.lines.push('', '*****', '');
    });
    return this.lines.join('\n');
  }
});

module.exports = Markdown;
