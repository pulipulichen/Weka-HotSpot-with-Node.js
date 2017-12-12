TemplateUtils = {
    convert_to_template_json: function (_data) {
        if (Array.isArray(_data)) {
            var _array = [];
            for (var _i = 0; _i < _data.length; _i++) {
                var _element = _data[_i];
                if (typeof(_element["element"]) === "undefined") {
                    _element = {"element": this.convert_to_template_json(_element)};
                }
                _array.push(_element);
            }
            return _array;
        }
        else if (typeof(_data) === "object") {
            var _array = [];
            for (var _key in _data) {
                var _element_data = this.convert_to_template_json(_data[_key]);
                var _element = {
                    "key": _key,
                    "data": _element_data
                };
                _array.push(_element);
            }
            return _array;
        }
        else {
            return _data;
        }
    },
    json_to_array: function (_json) {
         var _array = [];
        for (var _key in _json) {
            var _element_data = _json[_key];
            var _element = {
                "key": _key,
                "data": _element_data
            };
            _array.push(_element);
        }
        return _array;
    },
    array_to_json: function (_data) {
        var _array = [];
        for (var _i = 0; _i < _data.length; _i++) {
            var _element = _data[_i];
            if (typeof(_element["element"]) === "undefined") {
                _element = {"element": _element};
            }
            _array.push(_element);
        }
        return _array;
    },
    
    get_sig_sign: function (_sig_level) {
        var _sig = "";
        for (var _i = 0; _i < _sig_level; _i++) {
            _sig = _sig + "*";
        }
        return _sig;
    },
    decimal_rounding: function (_number, _cfg_decimal_rounding) {
        if (_cfg_decimal_rounding === undefined) {
            _cfg_decimal_rounding = parseNumber(cfg.stat.decimal_rounding);
        }
        _number = _number * Math.pow(10, _cfg_decimal_rounding);
        _number = Math.round(_number);
        return _number / Math.pow(10, _cfg_decimal_rounding);
    },
    json_decimal_rounding: function (_json, _decimal_rounding) {
        if (typeof(_json) === "number") {
            return this.decimal_rounding(_json, _decimal_rounding);
        }
        else if (Array.isArray(_json)) {
            var _output_array = [];
            for (var _i = 0; _i < _json.length; _i++) {
                _output_array.push(this.json_decimal_rounding(_json[_i], _decimal_rounding));
            }
            return _output_array;
        }
        else if (typeof(_json) === "object") {
            var _output_json = {};
            for (var _i in _json) {
                _output_json[_i] = this.json_decimal_rounding(_json[_i], _decimal_rounding);
            }
            return _output_json;
        }
        else {
            return _json;
        }
    },
    render: function (_template_name, _data) {
        var _template_path = "./templates/" + _template_name + ".html";
        var _template = fs.readFileSync(_template_path,'utf8');
        return Mustache.render(_template, _data);
    }
    
    // ----------------------------
    
    // -----------------------------------------
    
    
};