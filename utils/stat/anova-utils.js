AnovaUtils = {
    analyze: function (_group_json) {
        var _group_id = [];
        var _group_array = [];

        for (var _group_name in _group_json) {
            _group_id.push(_group_name);
            _group_array.push(_group_json[_group_name]);
        }

        var _n = 0;
        for (var _group_name in _group_json) {
            _n = _n + _group_json[_group_name].length;
        }

        //console.log(_group_array);
        //var _f_score = jStat.anovafscore(_group_array);
        var _f_score = anova.test(_group_array);
        var _p_value = null;
        var _sig_level = 0;
        
        if (isNaN(_f_score) === false) {
            var _df1 = _group_id.length - 1;
            var _df2 = _n - _df1;
            _p_value = jStat.ftest(_f_score, _df1, _df2);
            _sig_level = this.sig_level(_p_value);
        }
        else {
            _f_score = null;
        }
        //console.log([_f_score, _df1, _df2, _p_value]);

        var _anova_data = {
            "f-score": _f_score,
            "p-value": _p_value,
            "sig-level": _sig_level
        };

        // ------------------------
        // 算出平均值跟標準差
        var _avg_data = {};
        var _stddev_data = {};

        for (var _group_name in _group_json) {
            var _data_array = _group_json[_group_name];
            
            if (_data_array.length > 0) {
                _avg_data[_group_name] = jStat.mean(_data_array);
                _stddev_data[_group_name] = jStat.stdev(_data_array);
            }
            else {
                _avg_data[_group_name] = null;
                _stddev_data[_group_name] = null;
            }
        }

        // -------------------------

        var _tukeyhsd_result = jStat.tukeyhsd(_group_array);
        //console.log(_tukeyhsd_result);

        var _tukeyhsd_compare = {};
        for (var _group_name in _group_json) {
            _tukeyhsd_compare[_group_name] = [];
        }

        for (var _c = 0; _c < _tukeyhsd_result.length; _c++) {
            var _p = _tukeyhsd_result[_c][1];
            var _sig_level = this.sig_level(_p);
            if (_sig_level === 0) {
                continue;
            }

            var _group1_id = _tukeyhsd_result[_c][0][0];
            var _group1_name = _group_id[_group1_id];
            var _group1_avg = _avg_data[_group1_name];

            var _group2_id = _tukeyhsd_result[_c][0][1];
            var _group2_name = _group_id[_group2_id];
            var _group2_avg = _avg_data[_group2_name];
            
            if (_group1_avg === null 
                    || _group2_avg === null ) {
                continue;
            }
            
            
            if (_group1_avg > _group2_avg) {
                _tukeyhsd_compare[_group1_name].push({
                    "comparison": _group1_name + " > " + _group2_name,
                    "tukeyhsd-p-value": _p,
                    "sig-level": _sig_level
                });
                _tukeyhsd_compare[_group2_name].push({
                    "comparison": _group2_name + " < " + _group1_name,
                    "tukeyhsd-p-value": _p,
                    "sig-level": _sig_level
                });
            }
            else if (_group1_avg < _group2_avg) {
                _tukeyhsd_compare[_group1_name].push({
                    "comparison": _group1_name + " < " + _group2_name,
                    "tukeyhsd-p-value": _p,
                    "sig-level": _sig_level
                });
                _tukeyhsd_compare[_group2_name].push({
                    "comparison": _group2_name + " > " + _group1_name,
                    "tukeyhsd-p-value": _p,
                    "sig-level": _sig_level
                });
            }
        }

        // ----------------------
        // 試著把它組合在一起
        var _output_json = {
            "anova": _anova_data,
            "avg": _avg_data,
            "stddev": _stddev_data,
            "post-hoc": _tukeyhsd_compare
            //"tukeyhsd": JSON.stringify(_tukeyhsd_compare)
        };
        return _output_json;
    },
    sig_level: function (_p_value) {
        if (_p_value === 0) {
            return 0;
        }
        
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
    }
};