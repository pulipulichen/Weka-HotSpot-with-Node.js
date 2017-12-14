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
        if (typeof(_number) !== "number") {
            return _number;
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
        else if (typeof(_json) === "object" && _json !== null) {
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
        
        _data["i18n"] = function () {
            return function(_text, _render) {
                return i18n.__(_render(_text.trim()));
            };
        };
        
        try {
            return Mustache.render(_template, _data);
        }
        catch (_e) {
            throw "Render error: " + _e
                + "\nTempalte name: " + _template_name 
                + "\nData: " + JSON.stringify(_data);
        }
    },
    
    // ----------------------------
    parse_notes: function (_data) {
        
        var _notes = [];
        
        var _alpha_levels = cfg.stat.alpha.split(",");
        if (JSONUtils.has_key_value(_data, "sig-level", 1)) {
            _notes.push("* : " + i18n.__("p-value") + " < " + _alpha_levels[0]);
        }
        if (JSONUtils.has_key_value(_data, "sig-level", 2)) {
            _notes.push("** : " + i18n.__("p-value") + " < " + _alpha_levels[1]);
        }
        if (JSONUtils.has_key_value(_data, "sig-level", 3)) {
            _notes.push("** : " + i18n.__("p-value") + " < " + _alpha_levels[2]);
        }
        
        if (JSONUtils.has_key_value(_data, "mode", "chi-sqr")) {
            _notes.push("<sup>c</sup>: " + i18n.__("Pearson's chi-squared test.") );
        }
        if (JSONUtils.has_key_value(_data, "mode", "yates-corr")) {
            _notes.push("<sup>y</sup>: " + i18n.__("Yates's chi-squared test.") );
        }
        if (JSONUtils.has_key_value(_data, "mode", "fisher-exact")) {
            _notes.push("<sup>f</sup>: " + i18n.__("Fisher's Exact Test's p-value.") );
        }
        // target_attribute_options
        if (JSONUtils.has_key(_data, "adj-residual")) {
            var _adj_residual_note = "<sup>r</sup>: " + i18n.__("Adjusted residual in crosstabs cell.");
            if (JSONUtils.has_key(_data, "target_attribute_options") === true) {
                if (JSONUtils.has_key_value(_data, "adj-residual-is-sig", true)) {
                    _notes.push(_adj_residual_note);
                }
            }
            else {
                _notes.push(_adj_residual_note);
            }
        }
        
        if (JSONUtils.has_key(_data, "f-score")) {
            _notes.push("<sup>a</sup>: " + i18n.__("ANOVA's f-score.") );
        }
        if (JSONUtils.has_key(_data, "tukeyhsd-p-value")) {
            _notes.push("<sup>t</sup>: " + i18n.__("TukeyHSD post-hot test's p-value.") );
        }
        
        if (JSONUtils.has_key(_data, "h-statistic")) {
            _notes.push("<sup>h</sup>: " + i18n.__("Kruskal-Wallis H test.") );
        }
        if (JSONUtils.has_key(_data, "dunn-p-value")) {
            _notes.push("<sup>d</sup>: " + i18n.__("Dunn's test's p-value.") );
        }
        
        return _notes;
    },
    
    
    // -----------------------------------------
    
    
};