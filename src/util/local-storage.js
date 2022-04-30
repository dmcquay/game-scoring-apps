if (global.localStorage) {
    module.exports = global.localStorage
} else {
    // for testing only
    module.exports = {
        getItem: function (key) {
            return this[key];
        },
        setItem: function (key, value) {
            this[key] = value;
        }
    }
}