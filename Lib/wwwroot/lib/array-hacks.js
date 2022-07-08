Array.prototype.last = function() {
    let keys = Object.keys(this);
    return this[keys[keys.length - 1]];
}