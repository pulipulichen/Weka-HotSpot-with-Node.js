get_input_files = function () {
    var _input_dir = './input/';
    var _input_files = fs.readdirSync(_input_dir);
    var _exclude_files = cfg.weka.train_set_excluded_files.split(",");

    var _input_files_qualified = [];
    for (var _i = 0; _i < _input_files.length; _i++) {
        var _is_qualified = true;

        var _file_name = _input_files[_i];
        var _last_dot_pos = _file_name.lastIndexOf(".");
        var _ext = _file_name.substring(_last_dot_pos+1, _file_name.length);
        if (_ext !== 'csv') {
            _is_qualified = false;
        }
        else {
            for (var _j = 0; _j < _exclude_files.length; _j++) {
                if (_input_files[_i] === _exclude_files[_j]) {
                    _is_qualified = true;
                    break;
                }
            }
        }
        if (_is_qualified === true) {
            _input_files_qualified.push(path.resolve(_input_dir + _input_files[_i]));
        }
    }
    
    return _input_files_qualified;
};

mkdir = function (_path) {
    if (fs.existsSync(_path) === false) {
        fs.mkdirSync(_path);
    }
};