const pattern = (item) => {
  if (item.type === 'string' && item.pattern) {
    return `PATTERN(${item.pattern})`;
  }
  if (item.type === 'array' && item.items) {
    if (item.items.pattern) {
      return `PATTERN(${item.items.pattern})`;
    }
  }
  return null;
};

module.exports = pattern;
