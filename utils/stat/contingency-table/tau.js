Tau = {
    x2y: function (_ct_json) {
        var _total_sum = this.sum(_ct_json);
        var _x_sum_list = this.x_sum(_ct_json);
        var _y_sum_list = this.y_sum(_ct_json);

        var _n = _total_sum;

        var _e1 = 0;
        for (var _y_var_name in _y_sum_list) {
            var _f = _y_sum_list[_y_var_name];

            _e1 += ((_f * (_n - _f)) / _n);
        }

        var _e2 = 0;
        for (var _x_var_name in _ct_json) {
            var _e = 0;
            var _sum = _x_sum_list[_x_var_name];
            for (var _y_var_name in _ct_json[_x_var_name]) {
                var _f = _ct_json[_x_var_name][_y_var_name];

                _e += (_f * (_sum - _f));
            }
            _e2 += (_e / _sum);
        }

        var _tau = 1 - (_e2 / _e1);
        //console.log([_tau, _e2, _e1]);
        //_tau = _tau * 100;
        return _tau;
    },
    y2x: function (_ct_json) {
        var _total_sum = this.sum(_ct_json);
        var _x_sum_list = this.x_sum(_ct_json);
        var _y_sum_list = this.y_sum(_ct_json);
        
        var _n = _total_sum;
        var _e1 = 0;
        for (var _x_var_name in _x_sum_list) {
            var _f = _x_sum_list[_x_var_name];

            _e1 += ((_f * (_n - _f)) / _n);
        }

        var _e2 = 0;
        var _e_y = {};
        for (var _x_var_name in _ct_json) {
            for (var _y_var_name in _ct_json[_x_var_name]) {

                var _sum = _y_sum_list[_y_var_name];
                var _f = _ct_json[_x_var_name][_y_var_name];

                if (typeof (_e_y[_y_var_name]) === "undefined") {
                    _e_y[_y_var_name] = 0;
                }
                _e_y[_y_var_name] += (_f * (_sum - _f));
            }
            //_e2 += (_e / _sum);
        }

        for (var _y_var_name in _e_y) {
            _e2 += (_e_y[_y_var_name] / _y_sum_list[_y_var_name]);
        }

        var _tau = 1 - (_e2 / _e1);
        return _tau;
    },
    
    //-------------------------------------
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
            if (typeof (_sum[_x]) === "undefined") {
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
                if (typeof (_sum[_y]) === "undefined") {
                    _sum[_y] = 0;
                }
                _sum[_y] = _sum[_y] + _contingency_table[_x][_y];
            }
        }
        return _sum;
    }
};