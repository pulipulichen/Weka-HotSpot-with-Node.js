get_input_files = function () {
    var _input_dir = cfg.file.input_dir;
    if (_input_dir.substr(_input_dir.length-1, 1) !== "/") {
        _input_dir += "/";
    }
    var _input_files = fs.readdirSync(_input_dir);
    var _exclude_files = cfg.file.input_excluded_files.split(",");

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

get_style_files = function () {
    var _input_dir = cfg.file.output_style_dir;
    var _input_files = fs.readdirSync(_input_dir);

    var _input_files_qualified = [];
    for (var _i = 0; _i < _input_files.length; _i++) {
        var _file_name = _input_files[_i];
        if (_file_name.substr(0,1) === ".") {
            continue;
        }
        _input_files_qualified.push(_file_name);
    }
    
    return _input_files_qualified;
};

mkdir = function (_path) {
    if (fs.existsSync(_path) === false) {
        fs.mkdirSync(_path);
    }
};