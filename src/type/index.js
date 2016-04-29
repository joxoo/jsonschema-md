const enumeration = require('./enum');
const pattern = require('./pattern');

module.exports = (item) => {
  const type = enumeration(item) || pattern(item);
  return type;
};
