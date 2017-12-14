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
        
        var _tfoot_html = TemplateUtils.render("stat-table/tfoot", {
            tfoot_colspan: _target_attribute_options_count + 2,
            note_html_array: TemplateUtils.parse_notes(_stat_data)
        });
        
        return TemplateUtils.render("stat-table/table", {
            file_name: _file_name,
            thead_html: _thead,
            tbody_html: _tbody,
            tfoot_html: _tfoot_html
        });
    },
    
    // --------------------
    
    render_stat_tr_numeric: function (_attr, _attr_data, _target_attribute_options_count) {
        var _data = {
            attr: _attr,
            test_html: this.render_stat_tr_numeric_test(_target_attribute_options_count, _attr_data),
            posthoc_html: this.render_stat_tr_numeric_list(_target_attribute_options_count, _attr_data["post-hoc"])
        };
        
        var _rowspan = 1;
        
        if (typeof(_attr_data["avg"]) !== "undefined") {
            _data["avg_html"] = this.render_stat_tr_numeric_indication(_target_attribute_options_count, _attr_data["avg"]);
            _rowspan++;
        }
        if (typeof(_attr_data["stddev"]) !== "undefined") {
            _data["stddev_html"] = this.render_stat_tr_numeric_indication(_target_attribute_options_count, _attr_data["stddev"]);
            _rowspan++;
        }
        if (typeof(_attr_data["median"]) !== "undefined") {
            _data["median_html"] = this.render_stat_tr_numeric_indication(_target_attribute_options_count, _attr_data["median"]);
            _rowspan++;
        }
        
        _data["rowspan"] = _rowspan;
        
        return TemplateUtils.render("stat-table/tbody-tr-numeric", _data);
    },
    
    render_stat_tr_numeric_test: function (_target_attribute_options_count, _attr_data) {
        //var _this = this;
        var _data = {
            target_attribute_options_count: _target_attribute_options_count
        };
        
        if (typeof(_attr_data["anova"]) !== "undefined") {
            _data["statistic"] = TemplateUtils.json_decimal_rounding(_attr_data["anova"]);
            _data["has_statistic"] = (_attr_data["anova"]["f-score"] !== null);
            _data["display_sign"] = function () {
                // {{ chi_square.mode }}: {{ chi_square.chisquare }} {{ chi_square.sig-level }}
                var _element = this;
                //console.log(_element);
                if (_element.statistic["f-score"] === null) {
                    return false;
                }
                
                var _output = TemplateUtils.json_decimal_rounding(_element.statistic["f-score"])
                    + "<sup>a</sup>"
                    + TemplateUtils.get_sig_sign(_element.statistic["sig-level"]);
                return _output;
            };
        }
        else if (typeof(_attr_data["kw-h-test"]) !== "undefined") {
            _data["statistic"] = TemplateUtils.json_decimal_rounding(_attr_data["kw-h-test"]);
            _data["has_statistic"] = (_attr_data["kw-h-test"]["h-statistic"] !== null);
            _data["display_sign"] = function () {
                // {{ chi_square.mode }}: {{ chi_square.chisquh-statistic"are }} {{ chi_square.sig-level }}
                var _element = this;
                //console.log(_element);
                if (_element.statistic["h-statistic"] === null) {
                    return false;
                }
                
                var _output = TemplateUtils.json_decimal_rounding(_element.statistic["h-statistic"])
                    + "<sup>h</sup>"
                    + TemplateUtils.get_sig_sign(_element.statistic["sig-level"]);
                return _output;
            };
        }
        
        return TemplateUtils.render("stat-table/tbody-tr-numeric-test", _data);
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
                       var _output = this.comparison;
                       if (typeof(this['tukeyhsd-p-value']) !== "undefined") {
                           _output += '<sup>t</sup>';
                       }
                       else if (typeof(this['dunn-p-value']) !== "undefined") {
                           _output += '<sup>d</sup>';
                       }
                       _output += TemplateUtils.get_sig_sign(this["sig-level"]);
                       //console.log(_output);
                       return _output;
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
                
                var _mode_abbr = 'c';
                var _mode = _element.chi_square.mode;
                if (_mode === "yates-corr") {
                    _mode_abbr = "y";
                }
                else if (_mode === "fisher-exact") {
                    _mode_abbr = "f";
                }
                
                var _output = TemplateUtils.json_decimal_rounding(_element.chi_square.chisquare)
                    + '<sup>' + _mode_abbr + '</sup>'
                    + TemplateUtils.get_sig_sign(_element.chi_square["sig-level"]);
                return _output;
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
                        var _output = _element.option + ": "
                            + TemplateUtils.json_decimal_rounding(_element["adj-residual"])
                            + '<sup>r</sup>' 
                            + TemplateUtils.get_sig_sign(_element["sig-level"]);
                        return _output;
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