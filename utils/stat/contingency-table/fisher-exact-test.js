FisherExactTest = {
    analyze: function (_ct_json) {
        var _p = 0;

        var _ext_ary = [];

        // 先找出最小的那個值
        var _min; 
        var _min_pos = 0;
        var _i = 0;
        var _origin_first;

        this.traverse_ct_json(_ct_json, function (_x, _y, _num) {
            if (_i === 0) {
                _origin_first = _num;
            }

            if (_min === undefined) {
                _min = _num;
            }
            else if (_num < _min) {
                _min = _num;
                _min_pos = _i;
            }


            _ext_ary.push(_num);
            _i++;
        });

        var _adj_pos = _min + 1;
        if (_min_pos % 2 === 1) {
            _adj_pos = _min - 1;
        }

        // ---------------------

        // 調整成極端值

        var _max;
        for (var _i = 0; _i < _ext_ary.length; _i++) {
            var _num = _ext_ary[_i];
            if (_min_pos === 1 || _min_pos === 2) {
                if (_i === 0 || _i === 3 ) {
                    _num = _num+_min;
                }
                else {
                    _num = _num-_min;
                }
            }
            else {
                if (_i === 0 || _i === 3 ) {
                    _num = _num-_min;
                }
                else {
                    _num = _num+_min;
                }
            }


            if (_max === undefined) {
                _max = _num;
            }
            else if (_num > _max) {
                _max = _num;
            }
            _ext_ary[_i] = _num;
        }

        //console.log(_ext_ary);

        // ---------------------
        // p1跟p2都是固定的，先算p1跟p2

        var _p1 = 1;
        var _x_sum_list = this.x_sum(_ct_json);
        var _y_sum_list = this.y_sum(_ct_json);
        
        for (var _x in _x_sum_list) {
            var _sum = _x_sum_list[_x];
            _p1 = _p1 * this.calc_factorial(_sum);
        }
        for (var _y in _y_sum_list) {
            var _sum = _y_sum_list[_y];
            _p1 = _p1 * this.calc_factorial(_sum);
        }

        var _total_sum = this.sum(_ct_json);
        var _p2 = this.calc_factorial(_total_sum);

        // --------------------------------
        var _p4;
        var _original_p4;
        var _p4_list = [];

        for (var _i = 0; _i < _max+1; _i++) {
            var _ext_ary2 = [];
            var _has_zero = false;
            var _over_original_flag = false;
            for (var _e = 0; _e < _ext_ary.length; _e++) {
                var _n;
                if (_e === 0 || _e === 3) {
                    if (_min_pos === 1 || _min_pos === 2) {
                        _n = _ext_ary[_e]-_i;
                    }
                    else {
                        _n = _ext_ary[_e]+_i;
                    }
                    _ext_ary2.push(_n);
                }
                else {
                    if (_min_pos === 1 || _min_pos === 2) {
                        _n = _ext_ary[_e]+_i;
                    }
                    else {
                        _n = _ext_ary[_e]-_i;
                    }
                    _ext_ary2.push(_n);
                }

                if (_i > 0 && _n === 0) {
                    _has_zero = true;
                }

                if (_e === 0 && _n === _origin_first) {
                    _over_original_flag = true;
                }
            }

            _p4 = (_p1 / (_p2 * this.calc_p3(_ext_ary2)) );
            if (_over_original_flag === true) {
                _original_p4 = _p4;
            }

            //console.log(_ext_ary2);
            //console.log((_p1 / (_p2 * _calc_p3(_ext_ary2)) ));


            //if (_over_original === false) {
                //console.log(['p4', _p4]);
            //    _p += _p4;
            //}
            //console.log(_ext_ary2);
            //console.log(_p4);
            _p4_list.push(_p4);

            //if (_over_original_flag === true) {
            //    _over_original = true;
            //}

            if (_has_zero === true) {
                //console.log(['last p4', _last_p4]);
                //console.log(['p4', _p4]);
                //_p += _p4 + _last_p4;
                break;
            }
            //_last_p4 = _p4;
        }

        for (var _i = 0; _i < _p4_list.length; _i++) {
            if (_p4_list[_i] <= _original_p4) {
                _p += _p4_list[_i];
            }
        }

        return _p;
    },
    calc_p3: function (_ary) {
        var _p = 1;
        for (var _i = 0; _i < _ary.length; _i++) {
            _p = _p * this.calc_factorial(_ary[_i]);
        }
        return _p;
    },
    calc_factorial: function (num) {
        //num = Math.ceil(num);
        if (num < 0) {
            throw "Error num: " + num;
        }

        if (num === 0) { 
            return 1; 
        }
        else { 
            return num * this.calc_factorial( num - 1 ); 
        }
    },
    traverse_ct_json: function (_ct_json, _callback) {
        for (var _x_var_name in _ct_json) {
            for (var _y_var_name in _ct_json[_x_var_name]) {
                _callback(_x_var_name, _y_var_name, _ct_json[_x_var_name][_y_var_name]);
            }
        }
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
    }
};