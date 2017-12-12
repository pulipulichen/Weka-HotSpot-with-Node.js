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
    decimal_rounding: function (_number) {
        var _cfg_decimal_rounding = parseNumber(cfg.stat.decimal_rounding);
        _number = _number * Math.pow(10, _cfg_decimal_rounding);
        _number = Math.round(_number);
        return _number / Math.pow(10, _cfg_decimal_rounding);
    },
    json_decimal_rounding: function (_json) {
        if (typeof(_json) === "number") {
            return this.decimal_rounding(_json);
        }
        else if (Array.isArray(_json)) {
            var _output_array = [];
            for (var _i = 0; _i < _json.length; _i++) {
                _output_array.push(this.json_decimal_rounding(_json[_i]));
            }
            return _output_array;
        }
        else if (typeof(_json) === "object") {
            var _output_json = {};
            for (var _i in _json) {
                _output_json[_i] = this.json_decimal_rounding(_json[_i]);
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
    },
    
    // ----------------------------
    
    render_stat_table: function (_file_name, _stat_data) {
        //console.log(_target_attribute_options);
        var _thead = this.render("stat-table/thead", _stat_data);
        var _target_attribute_options_count = _stat_data["target_attribute_options"].length;
        
        var _tbody_tr_array = [];
        for (var _attr in _stat_data["attributes"]) {
            var _type = _stat_data["attributes_type"][_attr];
            var _attr_data = _stat_data["attributes"][_attr];
            
            if (_type === "numeric") {
                _tbody_tr_array.push(this.render_stat_tr_numeric(_attr, _attr_data, _target_attribute_options_count));
            }
            else if (_type === "nominal") {
                _tbody_tr_array.push(this.render_stat_tr_nominal(_attr, _attr_data, _target_attribute_options_count));
            }
        }
        
        var _tbody = this.render("stat-table/tbody", {tr: _tbody_tr_array});
        
        return this.render("stat-table/table", {
            file_name: _file_name,
            thead_html: _thead,
            tbody_html: _tbody
        });
    },
    
    // --------------------
    
    render_stat_tr_numeric: function (_attr, _attr_data, _target_attribute_options_count) {
        return "<tr><td>numeric</td></tr>";
    },
    
    // --------------------
    
    render_stat_tr_nominal: function (_attr, _attr_data, _target_attribute_options_count) {
        
        return this.render("stat-table/tbody-tr-nominal", {
            attr: _attr,
            test_html: this.render_stat_tr_nominal_test(_target_attribute_options_count, _attr_data["chi-square"]),
            group_html: this.render_stat_tr_nominal_group(_target_attribute_options_count, _attr_data["group-sig"])
        });
    },
    render_stat_tr_nominal_test: function (_target_attribute_options_count, _chi_suqare) {
        return this.render("stat-table/tbody-tr-nominal-test", {
            target_attribute_options_count: _target_attribute_options_count,
            chi_square: this.json_decimal_rounding(_chi_suqare)
        });
    },
    render_stat_tr_nominal_group: function (_target_attribute_options_count, _group_json) {
        var _group_td = [];
        var _this = this;
        for (var _group_name in _group_json) {
            _group_td.push(this.render("stat-table/tbody-tr-nominal-group", {
                "group-sig": this.json_decimal_rounding(_group_json[_group_name]),
                "display_sig": function () {
                    var _element = this;
                    var _output = [_element.option, ": "
                        , _this.json_decimal_rounding(_element["adj-residual"])
                        , _this.get_sig_sign(_element["sig-level"])];
                    return _output.join("");
                }
            }));
        }
        return _group_td.join("\n");
    }
};