run_weka_hotspot_commands = function (_input_files, _output_dir) {
    var _output_result = {};    
    for (var _i = 0; _i < _input_files.length; _i++) {
        var _file_name = _input_files[_i];
        _output_result[_file_name] = [];
        for (var _d = 0; _d < 2; _d++) {
            var _direction = "-L";
            if (_d === 1) {
                _direction = "-R";
            }
            _output_result[_file_name][_d] = [];
            var _option_index = 1;
            while (true) {
                var _cmd = build_weka_hotspot_command(_file_name, _direction, _option_index);
                console.log(_cmd);
                var _shell_result = shell.exec(_cmd);
                var _result = _shell_result.stdout;
                console.log(_result);
                sleep.sleep(3); // sleep for ten seconds
                _option_index++;
                
                if (_result.indexOf("java.lang.IllegalArgumentException: Index is too large") > 0) {
                    break;
                }
            }
        }
    }
};

build_weka_hotspot_command = function(_input_file_name, _direction, _option_index) {
    if (_option_index === undefined) {
        _option_index = 1;
    }
    if (_direction === undefined) {
        _direction = "-L";
    }
    
    // Local $cmd_weka = @comspec & ' /C Java -Dfile.encoding=utf-8 -cp ' & $extapp_weka & ' weka.Run ' & $weka_command & ' -t "' & $train_file & '" -c ' & $hotspot_targetIndex & ' -V ' & $param & ' -S ' & $hotspot_support & ' -M ' & $hotspot_max_branching_factor & ' -length ' & $hotspot_max_rule_length & ' -I 0.01 -L'
    return "%COMSPEC% /C Java -Dfile.encoding=utf-8 " 
            + '-cp "' + cfg.weka.extapp_weka + '" weka.Run weka.associations.HotSpot '
            + "-t " + _input_file_name + " "
            + ' -c ' + cfg.weka.hotspot_targetIndex + ' '
            + '-V ' + _option_index + " "
            + ' -S ' + cfg.weka.hotspot_support + " "
            + ' -M ' + cfg.weka.hotspot_max_branching_factor + " "
            + ' -length ' + cfg.weka.hotspot_max_rule_length + " "
            + ' -I 0.01 '
            + _direction;
};