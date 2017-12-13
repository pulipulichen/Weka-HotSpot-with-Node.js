TemplateHotspotTable = {
    render_hotspot_table: function (_file_name, _direction, _hotspot_json) {
        var _this = this;
        var _group_html_array = [];
        for (var _i = 0; _i < _hotspot_json.length; _i++) {
            var _rhs = _hotspot_json[_i]["rhs"];
            var _lhs = _hotspot_json[_i]["lhs"];
            for (var _j = 0; _j < _lhs.length; _j++ ) {
                var _html = "";

                if (_j === 0) {
                    _html = _this.render_hotspot_rhs(_rhs, _lhs.length);
                }
                _html += _this.render_hotspot_lhs(_lhs[_j]);

                _group_html_array.push('<tr data-lhs-attr="' + _lhs[_j].attribute + '">' + _html + '</tr>');
            }
        }
        
        var _tfoot_html = TemplateUtils.render("hotspot-table/tfoot", {
            tfoot_colspan: 9,
            note_html_array: TemplateUtils.parse_notes(_hotspot_json)
        });
        
        var _direction_display = "Maximize";
        if (_direction === "min") {
            _direction_display = "Minimize";
        }
        
        return TemplateUtils.render("hotspot-table/table", {
            "file_name": _file_name, 
            "direction": _direction_display,
            "target_attr": _hotspot_json[0]["rhs"]["attribute"],
            "group_html_array": _group_html_array,
            "tfoot_html": _tfoot_html
        });
    },
    
    render_hotspot_rhs: function (_rhs, _lhs_length) {
        return TemplateUtils.render("hotspot-table/th-rhs", {
            "rhs": _rhs,
            "lhs_length": _lhs_length
        });
    },
    
    render_hotspot_lhs: function (_lhs_item) {
        var _this = this;
        return TemplateUtils.render("hotspot-table/td-lhs", {
            "lhs_item": _lhs_item,
            "conf_func": function () {
                return _lhs_item["conf"] * 100;
            },
            "test_func": function () {
                var _html = "";
                var _test = _lhs_item["test"];
                if (typeof(_test["f-score"]) !== "undefined") {
                    // numeric
                    _html = TemplateUtils.json_decimal_rounding(_test["f-score"])
                        + '<sup>a</sup>'
                        + TemplateUtils.get_sig_sign(_test["sig-level"]);
                }
                else {
                    // nominal
                    var _mode_abbr = 'c';
                    var _mode = _test["mode"];
                    if (_mode === "yates-corr") {
                        _mode_abbr = "y";
                    }
                    else if (_mode === "fisher-exact") {
                        _mode_abbr = "f";
                    }
                    
                    
                    _html =  TemplateUtils.json_decimal_rounding(_test["chisquare"])
                        + '<sup>' + _mode_abbr + "</sup>"
                        + TemplateUtils.get_sig_sign(_test["sig-level"]);
                }
                return _html;
            },
            "comp_func": function () {
                var _html = "";
                var _comparison = _lhs_item["comparison"];
                if (typeof(_lhs_item["test"]["f-score"]) !== "undefined") {
                    if (_comparison.length > 0) {
                        var _li = [];
                        for (var _i = 0; _i < _comparison.length; _i++) {
                            _li.push("<div>" 
                                    + _comparison[_i]["comparison"] 
                                    + "<sup>t</sup>"
                                    + TemplateUtils.get_sig_sign(_comparison[_i]["sig-level"]) 
                                    + "</div>");
                        }
                        //_html = "<ul>" + _li.join("") + "</ul>";
                        _html = _li.join("");
                    }
                    else {
                        _html = "-";
                    }
                }
                else {
                    _html = TemplateUtils.json_decimal_rounding(_comparison["adj-residual"])
                        + '<sup>r</sup>'
                        + TemplateUtils.get_sig_sign(_comparison["sig-level"]);
                }
                return _html;
            }
        });
    }
};