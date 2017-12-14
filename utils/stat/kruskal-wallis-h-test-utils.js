/*
a = [0.28551035, 0.338524035, 0.088631321, 0.205930807, 0.363240102]
b = [0.52173913, 0.763358779, 0.325436786, 0.425305688, 0.378071834]
c = [0.98911968, 1.192718142, 0.788288288, 0.549176236, 0.544588155]
d = [1.26705653, 1.625320787, 1.266108976, 1.154187629, 1.268489431]
e = [1.25697569, 1.265897356, 1.237814561, 0.954612564, 2.365415457]

console.log(KruskalWallisHtestUtils.analyze({
    a: a, b: b, c: c, d:d, e:e
}));
 */
KruskalWallisHtestUtils = {
    analyze: function (_group_json) {
        
        var _statistic = this.kw_test(_group_json);
        var _group_median = this.group_median(_group_json);
        var _post_hoc = this.post_hoc(_group_json);
        return {
            "kw-h-test": _statistic,
            "median": _group_median,
            "post-hoc": _post_hoc
            //"tukeyhsd": JSON.stringify(_tukeyhsd_compare)
        };
    },
    kw_test: function (_group_json) {
        var _group_array = [];
        for (var _group in _group_json) {
            _group_array.push(_group_json[_group]);
        }
        var _kw_result = KruskalPython.exec(_group_array);
        var _sig_level = 0;
        _sig_level = this.sig_level(_kw_result.pvalue);
        var _statistic = {
            "h-statistic": _kw_result.statistic,
            "p-value": _kw_result.pvalue,
            "sig-level": _sig_level
        };
        return _statistic;
    },
    group_median: function (_group_json) {
        var _median_data = {};

        for (var _group_name in _group_json) {
            var _data_array = _group_json[_group_name];
            
            if (_data_array.length > 0) {
                _median_data[_group_name] = jStat.median(_data_array);
            }
            else {
                _median_data[_group_name] = null;
            }
        }
        
        return _median_data;
    },
    post_hoc: function (_group_json) {
        var _group_array = [];
        var _group_id = [];
        var _compare = {};
        for (var _group in _group_json) {
            _group_array.push(_group_json[_group]);
            _group_id.push(_group);
            _compare[_group] = [];
        }
        
        var _dunn_result = DunnPython.exec(_group_array);
        
        for (var _i in _dunn_result) {
            var _pair = _dunn_result[_i];
            
            var _p_value = _pair['p-value'];
            var _sig_level = this.sig_level(_p_value);
            if (_sig_level === 0) {
                continue;
            }
            
            var _pair_id = _pair.ID.split("-");
            var _group1_name = _group_id[parseNumber(_pair_id[0])];
            var _group2_name = _group_id[parseNumber(_pair_id[1])];
            
            var _stat = _pair.statistic;
            if (_stat > 0) {
                // 表示group1 > group2
                _compare[_group1_name].push({
                    "comparison": _group1_name + " > " + _group2_name,
                    "dunn-p-value": _p_value,
                    "sig-level": _sig_level
                });
                _compare[_group2_name].push({
                    "comparison": _group2_name + " < " + _group1_name,
                    "dunn-p-value": _p_value,
                    "sig-level": _sig_level
                });
            }
            else if (_stat < 0) {
                // 表示group1 < group2
                _compare[_group1_name].push({
                    "comparison": _group1_name + " < " + _group2_name,
                    "dunn-p-value": _p_value,
                    "sig-level": _sig_level
                });
                _compare[_group2_name].push({
                    "comparison": _group2_name + " > " + _group1_name,
                    "dunn-p-value": _p_value,
                    "sig-level": _sig_level
                });
            }
            
        }
        
        //console.log(DunnPython.exec([a,b,c,d]));
        return _compare;
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