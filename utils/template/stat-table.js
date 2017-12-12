TemplateStatTable = {
    render_stat_table: function (_file_name, _stat_data) {
        //console.log(_target_attribute_options);
        var _thead = TemplateUtils.render("stat-table/thead", _stat_data);
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
        
        var _tbody = TemplateUtils.render("stat-table/tbody", {tr: _tbody_tr_array});
        
        return TemplateUtils.render("stat-table/table", {
            file_name: _file_name,
            thead_html: _thead,
            tbody_html: _tbody
        });
    },
    
    // --------------------
    
    render_stat_tr_numeric: function (_attr, _attr_data, _target_attribute_options_count) {
        return TemplateUtils.render("stat-table/tbody-tr-numeric", {
            attr: _attr,
            test_html: this.render_stat_tr_numeric_test(_target_attribute_options_count, _attr_data),
            avg_html: this.render_stat_tr_numeric_indication(_target_attribute_options_count, _attr_data["avg"]),
            stddev_html: this.render_stat_tr_numeric_indication(_target_attribute_options_count, _attr_data["stddev"]),
            tukeyhsd_html: this.render_stat_tr_numeric_list(_target_attribute_options_count, _attr_data["tukeyhsd"])
        });
    },
    
    render_stat_tr_numeric_test: function (_target_attribute_options_count, _attr_data) {
        var _this = this;
        return TemplateUtils.render("stat-table/tbody-tr-numeric-test", {
            target_attribute_options_count: _target_attribute_options_count,
            anova: TemplateUtils.json_decimal_rounding(_attr_data["anova"]),
            display_sign: function () {
                // {{ chi_square.mode }}: {{ chi_square.chisquare }} {{ chi_square.sig-level }}
                var _element = this;
                var _output = ["f-score: "
                    , TemplateUtils.json_decimal_rounding(_element.anova["f-score"])
                    , TemplateUtils.get_sig_sign(_element.anova["sig-level"])];
                return _output.join("");
            }
        });
    },
    
    render_stat_tr_numeric_indication: function (_target_attribute_options_count, _group_json) {
        var _group_td = [];
        for (var _group_name in _group_json) {
            _group_td.push(TemplateUtils.render("stat-table/tbody-tr-numeric-indication", {
               "indication": TemplateUtils.json_decimal_rounding(_group_json[_group_name])
            }));
        }
        if (_group_td.length === 0) {
            //console.log(_target_attribute_options_count);
            _group_td.push(TemplateUtils.render("stat-table/tbody-tr-empty", {
                "target_attribute_options_count": _target_attribute_options_count
            }));
        }
        return _group_td.join("\n");
    },
    
    render_stat_tr_numeric_list: function (_target_attribute_options_count, _group_json) {
        var _group_td = [];
        //var _this = this;
        for (var _group_name in _group_json) {
            var _array = TemplateUtils.json_decimal_rounding(_group_json[_group_name]);
            
            if (_array.length > 0) { 
                _group_td.push(TemplateUtils.render("stat-table/tbody-tr-numeric-list", {
                   "list": _array,
                   "comp_func": function () {
                       return this.comparison + TemplateUtils.get_sig_sign(this["sig-level"]);
                   }
                }));
            }
            else {
                _group_td.push(TemplateUtils.render("stat-table/tbody-tr-td-empty", {
                    "target_attribute_options_count": 1
                }));
            }
        }
        if (_group_td.length === 0) {
            //console.log(_target_attribute_options_count);
            _group_td.push(TemplateUtils.render("stat-table/tbody-tr-td-empty", {
                "target_attribute_options_count": _target_attribute_options_count
            }));
        }
        return _group_td.join("\n");
    },
    // --------------------
    
    render_stat_tr_nominal: function (_attr, _attr_data, _target_attribute_options_count) {
        
        return TemplateUtils.render("stat-table/tbody-tr-nominal", {
            attr: _attr,
            test_html: this.render_stat_tr_nominal_test(_target_attribute_options_count, _attr_data["chi-square"]),
            group_html: this.render_stat_tr_nominal_group(_target_attribute_options_count, _attr_data["group-sig"])
        });
    },
    render_stat_tr_nominal_test: function (_target_attribute_options_count, _chi_suqare) {
        //var _this = this;
        return TemplateUtils.render("stat-table/tbody-tr-nominal-test", {
            target_attribute_options_count: _target_attribute_options_count,
            chi_square: TemplateUtils.json_decimal_rounding(_chi_suqare),
            display_sign: function () {
                // {{ chi_square.mode }}: {{ chi_square.chisquare }} {{ chi_square.sig-level }}
                var _element = this;
                var _output = [_element.chi_square.mode, ": "
                    , TemplateUtils.json_decimal_rounding(_element.chi_square.chisquare)
                    , TemplateUtils.get_sig_sign(_element.chi_square["sig-level"])];
                return _output.join("");
            }
        });
    },
    render_stat_tr_nominal_group: function (_target_attribute_options_count, _group_json) {
        var _group_td = [];
        //var _this = this;
        for (var _group_name in _group_json) {
            var _group_sig = TemplateUtils.json_decimal_rounding(_group_json[_group_name]);
            
            if (_group_sig.length > 0) {
                _group_td.push(TemplateUtils.render("stat-table/tbody-tr-nominal-group", {
                    "group-sig": _group_sig,
                    "display_sig": function () {
                        var _element = this;
                        var _output = [_element.option, ": "
                            , TemplateUtils.json_decimal_rounding(_element["adj-residual"])
                            , TemplateUtils.get_sig_sign(_element["sig-level"])];
                        return _output.join("");
                    }
                }));
            }
            else {
                _group_td.push(TemplateUtils.render("stat-table/tbody-tr-td-empty", {
                    "target_attribute_options_count": 1
                }));
            }
        }
        return _group_td.join("\n");
    }
    
};