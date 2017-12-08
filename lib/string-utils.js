substr_wrap = function (_str, _left_needle, _right_needle) {
    var _l_pos, _r_pos;
    if (_str.indexOf(_left_needle) === -1 && _str.indexOf(_right_needle) === -1) {
        return undefined;
    }
    else if (_str.indexOf(_right_needle) === -1) {
        _l_pos = _str.indexOf(_left_needle);
        return _str.substring(_l_pos+_left_needle.length, _str.length).trim();
    }
    else if (_str.indexOf(_left_needle) === -1) {
        _r_pos = _str.indexOf(_right_needle);
        return _str.substring(0, _r_pos).trim();
    }
    else {
        _l_pos = _str.indexOf(_left_needle);
        _r_pos = _str.indexOf(_right_needle, _l_pos + 1);
        return _str.substring(_l_pos+_left_needle.length, _r_pos).trim();
    }
};

parseNumber = function (_str) {
    if (isNaN(_str) === false) {
        var _tmp;
        eval("_tmp = " + _str);
        _str = _tmp;
    }
    return _str;
};