CSVUtils = {
    read: function (_path) {
        var _csv_file = fs.readFileSync(_path, 'utf8');
        return csv_parse(_csv_file, {columns: true});
    },
    get_target_attribute: function (_json) {
        var _cfg_target_attribute = cfg.hotspot.targetIndex;
        
        var _target_attribute;
        if (_cfg_target_attribute === "last") {
            for (_target_attribute in _json[0]) {
                // do nothing
            }
        }
        else {
            _target_attribute = _cfg_target_attribute;
        }
        return _target_attribute;
    },
    group_by_target_attribute: function (_json) {
        
        // _target_attribute
        var _target_attribute = this.get_target_attribute(_json);
        
        // ----------------
        // values
        var _data = {};
        
        for (var _i = 0; _i < _json.length; _i++) {
            var _row = _json[_i];
            if (typeof(_row[_target_attribute]) === "undefined") {
                continue;
            }
            
            var _group = _row[_target_attribute];
            if (_group === "?") {
                continue;
            }
            
            for (var _field in _row) {
                if (_field === _target_attribute) {
                    continue;
                }
                
                var _value = parseNumber(_row[_field]);
                if (_value === "" || _value === "?") {
                    continue;
                }

                if (_value === true) {
                    _value = "true";
                } 
                else if (_value === false) {
                    _value = "false";
                } 
                
                
                if (typeof(_data[_field]) === "undefined") {
                    _data[_field] = {};
                }
                if (typeof(_data[_field][_group]) === "undefined") {
                    _data[_field][_group] = [];
                }
                _data[_field][_group].push(_value);
            }
        }
        
        return _data;
    },
    flat_attribute_data: function (_group_json) {
        // attr.group.data
        var _attr_data = {};
        for (var _attr in _group_json) {
            if (typeof(_attr_data[_attr]) === "undefined") {
                _attr_data[_attr] = [];
            }
            
            for (var _group in _group_json[_attr]) {
                //_attr_data[_attr].concat(_group_json[_attr][_group]);
                for (var _i in _group_json[_attr][_group]) {
                    var _value = _group_json[_attr][_group][_i];
                    _attr_data[_attr].push(_value);
                }
            }
        }
        
        return _attr_data;
    },
    detect_attribute_type: function(_flat_attr_data) {
        var _types = {};
        
        for (var _attr in _flat_attr_data) {
            var _type = "numeric";
            
            for (var _i in _flat_attr_data[_attr]) {
                var _value = _flat_attr_data[_attr][_i];
                
                if (_value === "" || _value === null || _value === undefined || _value === "?") {
                    continue;
                }
                else if (isNaN(_value) === true) {
                    _type = "nominal";
                    break;
                }
            }
            
            _types[_attr] = _type;
        }
        
        return _types;
    },
    count_nominal_attribute_data: function (_group_json, _types_json) {
        var _output_json = {};
        for (var _attr in _group_json) {
            if (_types_json[_attr] === "numeric") {
                _output_json[_attr] = _group_json[_attr];
                continue;
            }
            
            // 先跑過所有的資料，取得nominal_options
            var _attr_data = _group_json[_attr];
            var _nominal_options = [];
            
            for (var _group in _attr_data) {
                for (var _i in _attr_data[_group]) {
                    var _value = _attr_data[_group][_i];
                    
                    if (_nominal_options.indexOf(_value) === -1) {
                        _nominal_options.push(_value);
                    }
                }
            }
            
            // 產生樣板
            var _nominal_count = {};
            for (var _group in _attr_data) {
                _nominal_count[_group] = {};
                for (var _i in _nominal_options) {
                    var _option = _nominal_options[_i];
                    _nominal_count[_group][_option] = 0;
                }
                
                for (var _i in _attr_data[_group]) {
                    var _value = _attr_data[_group][_i];
                    _nominal_count[_group][_value]++;
                }
            }
            
            // 加回去
            _output_json[_attr] = _nominal_count;
        }
        
        return _output_json;
    },
    
    // ---------------------------------
    stat: {
        analyse: function (_group_json, _types_json) {
            for (var _attr in _group_json) {
                if (_types_json[_attr] === "numeric") {
                    //console.log(_attr);
                    _group_json[_attr] = this.compare_numeric_data(_group_json[_attr]);
                }
                else {
                    _group_json[_attr] = this.compare_nominal_data(_group_json[_attr]);
                }
            }
            return _group_json;
        },
        compare_numeric_data: function (_group_json) {
            
            
            // 在這裡要決定樣本的大小
            var _small_sample_threshold = parseNumber(cfg.stat.small_sample_threshold);
            var _is_small_sample = false;
            for (var _g in _group_json) {
                if (_group_json[_g].length < _small_sample_threshold) {
                    _is_small_sample = true;
                    break;
                }
            }
            
            var _result;
            if (_is_small_sample) {
                _result = KruskalWallisHtestUtils.analyze(_group_json);
            }
            else {
                _result = AnovaUtils.analyze(_group_json);
            }
            
            return _result;
        },
        compare_nominal_data: function (_group_json) {
            return ChiSquareUtils.analyze(_group_json);
        }
    }
};