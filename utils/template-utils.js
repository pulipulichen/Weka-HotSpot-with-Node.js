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
        return this.render("stat-table/tbody-tr-numeric", {
            attr: _attr,
            test_html: this.render_stat_tr_numeric_test(_target_attribute_options_count, _attr_data),
            avg_html: this.render_stat_tr_numeric_indication(_target_attribute_options_count, _attr_data["avg"]),
            stddev_html: this.render_stat_tr_numeric_indication(_target_attribute_options_count, _attr_data["stddev"]),
            tukeyhsd_html: this.render_stat_tr_numeric_list(_target_attribute_options_count, _attr_data["tukeyhsd"])
        });
    },
    
    render_stat_tr_numeric_test: function (_target_attribute_options_count, _attr_data) {
        var _this = this;
        return this.render("stat-table/tbody-tr-numeric-test", {
            target_attribute_options_count: _target_attribute_options_count,
            anova: this.json_decimal_rounding(_attr_data["anova"]),
            display_sign: function () {
                // {{ chi_square.mode }}: {{ chi_square.chisquare }} {{ chi_square.sig-level }}
                var _element = this;
                var _output = ["F-score: "
                    , _this.json_decimal_rounding(_element.anova["f-score"])
                    , _this.get_sig_sign(_element.anova["sig-level"])];
                return _output.join("");
            }
        });
    },
    
    render_stat_tr_numeric_indication: function (_target_attribute_options_count, _group_json) {
        var _group_td = [];
        for (var _group_name in _group_json) {
            _group_td.push(this.render("stat-table/tbody-tr-numeric-indication", {
               "indication": this.json_decimal_rounding(_group_json[_group_name])
            }));
        }
        if (_group_td.length === 0) {
            //console.log(_target_attribute_options_count);
            _group_td.push(this.render("stat-table/tbody-tr-empty", {
                "target_attribute_options_count": _target_attribute_options_count
            }));
        }
        return _group_td.join("\n");
    },
    
    render_stat_tr_numeric_list: function (_target_attribute_options_count, _group_json) {
        var _group_td = [];
        for (var _group_name in _group_json) {
            var _array = this.json_decimal_rounding(_group_json[_group_name]);
            
            if (_array.length > 0) { 
                _group_td.push(this.render("stat-table/tbody-tr-numeric-list", {
                   "list": _array
                }));
            }
            else {
                _group_td.push(this.render("stat-table/tbody-tr-td-empty", {
                    "target_attribute_options_count": 1
                }));
            }
        }
        if (_group_td.length === 0) {
            //console.log(_target_attribute_options_count);
            _group_td.push(this.render("stat-table/tbody-tr-td-empty", {
                "target_attribute_options_count": _target_attribute_options_count
            }));
        }
        return _group_td.join("\n");
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
        var _this = this;
        return this.render("stat-table/tbody-tr-nominal-test", {
            target_attribute_options_count: _target_attribute_options_count,
            chi_square: this.json_decimal_rounding(_chi_suqare),
            display_sign: function () {
                // {{ chi_square.mode }}: {{ chi_square.chisquare }} {{ chi_square.sig-level }}
                var _element = this;
                var _output = [_element.chi_square.mode, ": "
                    , _this.json_decimal_rounding(_element.chi_square.chisquare)
                    , _this.get_sig_sign(_element.chi_square["sig-level"])];
                return _output.join("");
            }
        });
    },
    render_stat_tr_nominal_group: function (_target_attribute_options_count, _group_json) {
        var _group_td = [];
        var _this = this;
        for (var _group_name in _group_json) {
            var _group_sig = this.json_decimal_rounding(_group_json[_group_name]);
            
            if (_group_sig.length > 0) {
                _group_td.push(this.render("stat-table/tbody-tr-nominal-group", {
                    "group-sig": _group_sig,
                    "display_sig": function () {
                        var _element = this;
                        var _output = [_element.option, ": "
                            , _this.json_decimal_rounding(_element["adj-residual"])
                            , _this.get_sig_sign(_element["sig-level"])];
                        return _output.join("");
                    }
                }));
            }
            else {
                _group_td.push(this.render("stat-table/tbody-tr-td-empty", {
                    "target_attribute_options_count": 1
                }));
            }
        }
        return _group_td.join("\n");
    }
};