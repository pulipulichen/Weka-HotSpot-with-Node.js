ChiSquareUtils = {
    example_data: {
        "male": {
            "item1": 6,
            "item2": 5,
            "item3": 9,
            "item4": 4
        },
        "female": {
            "item1": 16,
            "item2": 5,
            "item3": 4,
            "item4": 1
        }
    },
    analyze: function (_contingency_table) {
        
        var _cell_json = this.cell_analyze(_contingency_table);
        
        // ----------------
        
        var _group_sig = {};
        
        for (var _x in _cell_json) {
            for (var _y in _cell_json[_x]) {
                var _sig_level = _cell_json[_x][_y]["sig-level"];
                if (_sig_level > 0) {
                    if (typeof(_group_sig[_x]) === "undefined") {
                        _group_sig[_x] = [];
                    }
                    _group_sig[_x].push({
                        "option": _y,
                        "adj-residual": _cell_json[_x][_y]["adj-residual"],
                        "sig-level": _sig_level
                    });
                }
            }
        }
        
        // ----------------
        
        var _mode = "chi-sqr";
        
        var _x_vars_count = this.x_len(_contingency_table);
        var _y_vars_count = this.y_len(_contingency_table);
        if (_x_vars_count === 2 && _y_vars_count === 2) {
            var _min_exp = this.get_min_exp(_cell_json);
            if (_min_exp < 5) {
                var _total_sum = this.sum(_contingency_table);
                if (_total_sum < 20) {
                    _mode = "fisher-exact";
                }
                else {
                    _mode = "yates-corr";
                }
            }
        }
        
        var _chi_sqr;
        if (_mode === "chi-sqr") {
            _chi_sqr = this.chisquared(_cell_json);
        }
        else if (_mode === "yates-corr") {
            _chi_sqr = this.yates_chisquared(_cell_json);
        }
        else {
            _chi_sqr = this.fisher_exact_test(_contingency_table);
        }
        _chi_sqr["mode"] = _mode;
        
        // ----------------
        
        return {
            "chi-square": _chi_sqr,
            //"group-sig": JSON.stringify(_group_sig),
            "group-sig": _group_sig,
            "cell": _cell_json,
            "tau-y2x": Tau.y2x(_contingency_table)
        };
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

                //var _total_per = _num / _total_sum;
                //var _y_per = _num / _y_sum_list[_y_var_name];
                //var _x_per = _num / _x_sum_list[_x_var_name];
                
                var _exp = (_x_sum_list[_x_var_name] * _y_sum_list[_y_var_name]) / _total_sum;

                var _residual = _num - _exp;

                var _std_residual = _residual / Math.sqrt(_exp);
                
                var _adj_residual = _residual / Math.sqrt( _exp * (1 - _x_per_list[_x_var_name]) * (1 - _y_per_list[_y_var_name]) );
                // 我要這格

                var _sig_level = this.zscore_sig_level(_adj_residual);
                //console.log([_x_var_name, _y_var_name, _adj_residual, _sig_level]);
                
                //var _y = ( Math.pow((Math.abs(_residual) - 0.5), 2) / _exp );
                //_yates_chi_squared += _y;
                //console.log([_yates_chi_squared, _y]);
                
                if (typeof(_cell_json[_x_var_name]) === "undefined") {
                    _cell_json[_x_var_name] = {};
                }
                _cell_json[_x_var_name][_y_var_name] = {
                    "exp": _exp,
                    "std-residual": _std_residual,
                    "yates-residual": ( Math.pow((Math.abs(_residual) - 0.5), 2) / _exp ),
                    "adj-residual": _adj_residual,
                    "sig-level": _sig_level
                };
            }
        }
        return _cell_json;
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
        var _sig_level = this.sig_level(_p_value);
        return {
            "chisquare": _chi_squared,
            "p-value": _p_value,
            "sig-level": _sig_level
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
        var _sig_level = this.sig_level(_p_value);
        return {
            "chisquare": _chi_squared,
            "p-value": _p_value,
            "sig-level": _sig_level
        };
    },
    sig_level: function (_p_value) {
        var _alpha_levels = cfg.stat.alpha.split(",");
        var _level = -1;
        for (var _i = _alpha_levels.length - 1; _i >= 0; _i--) {
            var _alpha = parseNumber(_alpha_levels[_i]);
            if (_p_value < _alpha) {
                _level = _i;
                break;
            }
        }
        return _level+1;
    },
    zscore_sig_level: function (_z_score) {
        _z_score = Math.abs(_z_score);
        var _p_value = jStat.ztest(_z_score, 2);
        return this.sig_level(_p_value);
    },
    /**
     * @author https://stackoverflow.com/a/36577594/6645399
     * @param {type} p
     * @returns {Number}
     */
    percentile_z: function (p) {
        var a0= 2.5066282,  a1=-18.6150006,  a2= 41.3911977,   a3=-25.4410605,
            b1=-8.4735109,  b2= 23.0833674,  b3=-21.0622410,   b4=  3.1308291,
            c0=-2.7871893,  c1= -2.2979648,  c2=  4.8501413,   c3=  2.3212128,
            d1= 3.5438892,  d2=  1.6370678, r, z;

        if (p>0.42) {
            r=Math.sqrt(-Math.log(0.5-p));
            z=(((c3*r+c2)*r+c1)*r+c0)/((d2*r+d1)*r+1);
        } else {
            r=p*p;
            z=p*(((a3*r+a2)*r+a1)*r+a0)/((((b4*r+b3)*r+b2)*r+b1)*r+1);
        }
        return z;
    },
    get_min_exp: function (_cell_json) {
        var _min_exp;
        for (var _x in _cell_json) {
            for (var _y in _cell_json[_x]) {
               var _exp = _cell_json[_x][_y]["exp"];
               if (_min_exp === undefined || _exp < _min_exp) {
                   _min_exp = _exp;
                   if (_min_exp === 0) {
                       return 0;
                   }
               }
            }
        }
        return _min_exp;
    },
    cramer_v: function (_chi_squared, _x_vars_count, _y_vars_count, _total_sum) {        
        
        var _cramer_v_k = _x_vars_count;
        if (_y_vars_count < _x_vars_count) {
            _cramer_v_k = _y_vars_count;
        }
        var _cramer_v = Math.sqrt(_chi_squared / (_total_sum * (_cramer_v_k - 1)) );
        return _cramer_v;
    },
    fisher_exact_test: function (_contingency_table) {
        var _p_value = FisherExactTest.analyze(_contingency_table);
        var _sig_level = this.sig_level(_p_value);
        return {
            "chisquare": _p_value,
            "p-value": _p_value,
            "sig-level": _sig_level
        };
    }
};