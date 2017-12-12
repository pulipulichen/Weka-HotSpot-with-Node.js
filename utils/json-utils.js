JSONUtils = {
    has_key: function (_data, _key) {
        if (Array.isArray(_data)) {
             for (var _i = 0; _i < _data.length; _i++) {
                 var _has_key = JSONUtils.has_key(_data[_i], _key);
                 if (_has_key === true) {
                     return true;
                 }
             }
        }
        else if (typeof(_data) === "object") {
            for (var _i in _data) {
                if (_i === _key) {
                    return true;
                }
                
                var _has_key = JSONUtils.has_key(_data[_i], _key);
                if (_has_key === true) {
                    return true;
                }
            }
        }
        
        return false;
    },
    has_key_value: function (_data, _key, _value) {
        if (Array.isArray(_data)) {
             for (var _i = 0; _i < _data.length; _i++) {
                 var _has_key = JSONUtils.has_key_value(_data[_i], _key, _value);
                 if (_has_key === true) {
                     return true;
                 }
             }
        }
        else if (typeof(_data) === "object") {
            for (var _i in _data) {
                if (_i === _key && _data[_i] === _value) {
                    return true;
                }
                
                var _has_key = JSONUtils.has_key_value(_data[_i], _key, _value);
                if (_has_key === true) {
                    return true;
                }
            }
        }
        
        return false;
    }
};

json_sort_by_key = function (unordered) {
    // https://stackoverflow.com/a/31102605/6645399
    var ordered = {};
    Object.keys(unordered).sort().forEach(function(key) {
        ordered[key] = unordered[key];
    });
    return ordered;
};

