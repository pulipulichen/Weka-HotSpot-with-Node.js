KruskalWallisHtestUtils = {
    analyze: function (_group_json) {
        var _statistic = this.kw_test(_group_json);
        var _group_median = this.group_median(_group_json);
        
    },
    kw_test: function (_group_json) {
        var _kw_result = KruskalPython(_group_json);
        var _sig_level = 0;
        _sig_level = this.sig_level(_kw_result.pvalue);
        var _statistic = {
            "f-score": _kw_result.statistic,
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
    post_hot: function (_group_json) {
        //console.log(DunnPython.exec([a,b,c,d]));
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