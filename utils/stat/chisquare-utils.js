ChiSquareUtils = {
    analyze: function (_contingency_table) {
        var _cell_json = this.cell_analyze(_contingency_table);
        
        return this.chisquared(_cell_json);
    },
    x_len: function (_contingency_table) {
        var _x_len = 0;
        for (var _x in _contingency_table) {
            _x_len++;
        }
        return _x_len;
    },
    y_len: function (_contingency_table) {
        var _y_len = 0;
        for (var _x in _contingency_table) {
            for (var _y in _contingency_table[_x]) {
                _y_len++;
            }
            break;
        }
        return _y_len;
    },
    df: function (_contingency_table) {
        
        return ( (this.x_len(_contingency_table)-1) * (this.y_len(_contingency_table)-1) );
    },
    sum: function (_contingency_table) {
        var _sum = 0;
        for (var _i in _contingency_table) {
            for (var _j in _contingency_table[_i]) {
                _sum = _sum + _contingency_table[_i][_j];
            }
        }
        return _sum;
    },
    x_sum: function (_contingency_table) {
        var _sum = {};
        for (var _x in _contingency_table) {
            if (typeof(_sum[_x]) === "undefined") {
                _sum[_x] = 0;
            }
            for (var _y in _contingency_table[_x]) {
                _sum[_x] = _sum[_x] + _contingency_table[_x][_y];
            }
        }
        return _sum;
    },
    y_sum: function (_contingency_table) {
        var _sum = {};
        for (var _x in _contingency_table) {
            for (var _y in _contingency_table[_x]) {
                if (typeof(_sum[_y]) === "undefined") {
                    _sum[_y] = 0;
                }
                _sum[_y] = _sum[_y] + _contingency_table[_x][_y];
            }
        }
        return _sum;
    },
    x_per: function (_contingency_table) {
        var _total_sum = this.sum(_contingency_table);
        var _x_sum_list = this.x_sum(_contingency_table);
        var _per = {};
        for (var _i in _x_sum_list) {
            _per[_i] = _x_sum_list[_i] / _total_sum;
        }
        return _per;
    },
    y_per: function (_contingency_table) {
        var _total_sum = this.sum(_contingency_table);
        var _sum_list = this.y_sum(_contingency_table);
        var _per = {};
        for (var _i in _sum_list) {
            _per[_i] = _sum_list[_i] / _total_sum;
        }
        return _per;
    },
    cell_analyze: function (_ct_json) {
        var _cell_json = {};
        
        var _total_sum = this.sum(_ct_json);
        var _x_sum_list = this.x_sum(_ct_json);
        var _y_sum_list = this.y_sum(_ct_json);
        var _x_per_list = this.x_per(_ct_json);
        var _y_per_list = this.y_per(_ct_json);
        //console.log([_total_sum, _x_sum_list, _x_per_list, _y_sum_list, _y_per_list]);
        
        for (var _x_var_name in _ct_json) {
            for (var _y_var_name in _ct_json[_x_var_name]) {
                var _num = _ct_json[_x_var_name][_y_var_name];

                var _total_per = _num / _total_sum;
                var _y_per = _num / _y_sum_list[_y_var_name];

                var _x_per = _num / _x_sum_list[_x_var_name];
                
                var _exp = (_x_sum_list[_x_var_name] * _y_sum_list[_y_var_name]) / _total_sum;

                var _residual = _num - _exp;

                var _std_residual = _residual / Math.sqrt(_exp);
                
                var _adj_residual = _residual / Math.sqrt( _exp * (1 - _x_per_list[_x_var_name]) * (1 - _y_per_list[_y_var_name]) );
                // 我要這格


                if (Math.abs(_adj_residual) > 1.96) {
                    if (_adj_residual < -1.96) {
                        //_tbody.find('tr[y_var="' + _y_var_name + '"] td[x_var="' + _x_var_name + '"]').addClass("neg");
                    }
                }
                //var _y = ( Math.pow((Math.abs(_residual) - 0.5), 2) / _exp );
                //_yates_chi_squared += _y;
                //console.log([_yates_chi_squared, _y]);
                
                if (typeof(_cell_json[_x_var_name]) === "undefined") {
                    _cell_json[_x_var_name] = {};
                }
                _cell_json[_x_var_name][_y_var_name] = {
                    "exp": _exp,
                    "std-residual": _std_residual,
                    "adj-residual": _adj_residual,
                    "yates-residual": ( Math.pow((Math.abs(_residual) - 0.5), 2) / _exp )
                };
            }
        }
        return _cell_json;
    },
    alpha: function () {
        return parseNumber(cfg.weka.stat_alpha);
    },
    chisquared: function (_cell_json) {
        var _df = this.df(_cell_json);
        var _chi_squared = 0;
        for (var _x_var_name in _cell_json) {
            for (var _y_var_name in _cell_json[_x_var_name]) {
                var _std_residual = _cell_json[_x_var_name][_y_var_name]["std-residual"];
                _chi_squared += (_std_residual * _std_residual);
            }
        }
        var _p_value = chisqrprob(_df, _chi_squared);
        var _is_sig = (_p_value < this.alpha());
        return {
            "chisquare": _chi_squared,
            "p-value": _p_value,
            "is-sig": _is_sig
        };
    },
    yates_chisquared: function (_cell_json) {
        var _df = this.df(_cell_json);
        var _chi_squared = 0;
        for (var _x_var_name in _cell_json) {
            for (var _y_var_name in _cell_json[_x_var_name]) {
                var _std_residual = _cell_json[_x_var_name][_y_var_name]["yates-residual"];
                _chi_squared += (_std_residual * _std_residual);
            }
        }
        var _p_value = chisqrprob(_df, _chi_squared);
        var _is_sig = (_p_value < this.alpha());
        return {
            "chisquare": _chi_squared,
            "p-value": _p_value,
            "is-sig": _is_sig
        };
    },
    sig_level: function (_p_value) {
        var _alpha_levels = cfg.weka.stat_alpha.split(",");
        var _level = -1;
        for (var _i = _alpha_levels.length - 1; _i >= 0; _i--) {
            var _alpha = parseNumber(_alpha_levels[_i]);
            if (_p_value < _alpha) {
                _level = _i;
                break;
            }
        }
        return _level;
    }
};