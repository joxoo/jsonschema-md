function enumeration(item) {
    if (item.type === 'string' && item.enum) {
        return item.enum.join(', ')
    }
    if (item.type === 'array' && item.items) {
        if (item.items.enum) {
            return 'enum(' + item.items.enum.join(', ') + ')';
        }
    }
    return null;
}

module.exports = enumeration;