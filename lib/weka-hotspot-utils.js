WekaHotSpotUtils = {
    build_command: function(_input_file_name, _option_index, _direction) {
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
    },

    run_commands: function (_input_files, _output_dir) {
        var _output_result = {};    
        for (var _i = 0; _i < _input_files.length; _i++) {
            var _file_name = _input_files[_i];
            _output_result[_file_name] = [];
            var _option_index = 1;
            var _index_too_large = false;
            while (_index_too_large === false) {
                for (var _d = 0; _d < 2; _d++) {
                    var _direction = "-L";
                    if (_d === 1) {
                        _direction = "-R";
                    }
                    var _cmd = this.build_command(_file_name, _option_index, _direction);

                    console.log(_cmd);
                    var _shell_result = shell.exec(_cmd);
                    //console.log(_shell_result);
                    if (_shell_result.stderr !== "") {
                        _index_too_large = true;
                        break;
                    }
                    var _result = _shell_result.stdout;

                    if (typeof(_output_result[_file_name][_option_index]) === "undefined") {
                        _output_result[_file_name][_option_index] = {};
                    }
                    _output_result[_file_name][_option_index][_direction] = _result;

                    //console.log(_result);
                    sleep.sleep(3); // sleep for ten seconds
                }
                _option_index++;
            }   
        }

        return _output_result;
    },

    parsing_raw_result: function (_result_raw) {
        var _result = {};
        
        for (var _file_name in _result_raw) {
            _result[_file_name] = {};
            
            var _file_result = _result_raw[_file_name];
            var _option_value_mapping = {};
            
            // 先試著取出RHS吧，噢對了，我想要畫caption
            for (var _option_index = 1; _option_index < _file_result.length; _option_index++) {
                var _option_result_l = _file_result[_option_index]["-L"];
                if (typeof(_result[_file_name]["__target_attribute"]) === "undefined") {
                    var _target_attribute = substr_wrap(_option_result_l, "Target attribute: ", "\n");
                    _result[_file_name]["__target_attribute"] = _target_attribute;
                }
                var _target_value = substr_wrap(_option_result_l, "Target value: ", "[");
                _option_value_mapping[_target_value] = _option_index;
            }
            
            // 排序
            _option_value_mapping = json_sort_by_key(_option_value_mapping);
            console.log(_option_value_mapping);
            
            for (var _target_value in _option_value_mapping) {
                var _target_result = _option_value_mapping[_target_value];
            }
        }
        
        return _result;
    }
}