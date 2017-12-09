CSVUtils = {
    read: function (_path) {
        var _csv_file = fs.readFileSync(_path, 'utf8');
        return csv_parse(_csv_file, {columns: true});
    },
    target_attribute_filter: function (_json) {
        // ------------------
        // _target_attribute
        
        var _cfg_target_attribute = cfg.weka.hotspot_targetIndex;
        
        var _target_attribute;
        if (_cfg_target_attribute === "last") {
            for (_target_attribute in _json[0]) {
                // do nothing
            }
        }
        else {
            _target_attribute = _cfg_target_attribute;
        }
        
        // ----------------
        // values
        var _target_value_data = {};
        
        for (var _i = 0; _i < _json.length; _i++) {
            var _row = _json[_i];
            if (typeof(_row[_target_attribute]) === "undefined") {
                continue;
            }
            
            var _value = _row[_target_attribute];
            
            if (typeof(_target_value_data[_value]) === "undefined") {
                _target_value_data[_value] = [];
            }
            
            var _row_data = {};
            for (var _col in _row) {
                if (_col === _target_attribute) {
                    continue;
                }
                _row_data[_col] = parseNumber(_row[_col]);
            }
            _target_value_data[_value].push(_row_data);
        }
        
        return _target_value_data;
    }
};