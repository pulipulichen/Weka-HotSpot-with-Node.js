WekaHotSpotUtils = {
    build_command: function(_input_file_name, _option_index, _minimize_target, _direction) {
        if (_option_index === undefined) {
            _option_index = 1;
        }
        if (_minimize_target === undefined) {
            _minimize_target = "";
        }
        if (_direction === undefined) {
            _direction = "";
        }

        // Local $cmd_weka = @comspec & ' /C Java -Dfile.encoding=utf-8 -cp ' & $extapp_weka & ' weka.Run ' & $weka_command & ' -t "' & $train_file & '" -c ' & $hotspot_targetIndex & ' -V ' & $param & ' -S ' & $hotspot_support & ' -M ' & $hotspot_max_branching_factor & ' -length ' & $hotspot_max_rule_length & ' -I 0.01 -L'
        return "%COMSPEC% /C Java -Dfile.encoding=utf-8 " 
                + ' -cp "' + cfg.weka.extapp_weka + '" weka.Run weka.associations.HotSpot '
                + ' -t "' + _input_file_name + '" '
                + ' -c ' + cfg.hotspot.targetIndex + ' '
                + ' -V ' + _option_index + " "
                + ' -S ' + cfg.hotspot.support + " "
                + ' -M ' + cfg.hotspot.max_branching_factor + " "
                + ' -length ' + cfg.hotspot.max_rule_length + " "
                + ' -I 0.01 '
                + _direction + " "
                + _minimize_target;
    },

    run_commands: function (_input_files) {
        var _debug = false;
        
        var _output_result = {};    
        for (var _i = 0; _i < _input_files.length; _i++) {
            var _path_name = _input_files[_i];
            var _file_name = path.basename(_path_name, '.csv');
            _output_result[_file_name] = [];
            var _option_index = 1;
            var _index_too_large = false;
            while (_index_too_large === false) {
                for (var _m = 0; _m < 2; _m++) {
                    
                    
                    var _minimize_target = "";
                    if (_m === 1) {
                        _minimize_target = "-L";
                    }
                    
                    for (var _d = 0; _d < 2; _d++) {
                        var _direction = "";
                        if (_d === 1) {
                            _direction = "-R";
                        }
                        var _cmd = this.build_command(_path_name, _option_index, _minimize_target, _direction);

                        console.log(_cmd);
                        
                        var _shell_result = shell.exec(_cmd);
                        //console.log(_shell_result);
                        if (_shell_result.stderr !== "" && _shell_result.stderr.indexOf("large") > -1) {
                            _index_too_large = true;
                            //console.log("too large: " + _shell_result.stderr);
                            console.log("too large");
                            break;
                        }
                        var _result = _shell_result.stdout;

                        if (typeof(_output_result[_file_name][_m]) === "undefined") {
                            _output_result[_file_name][_m] = [];
                        }
                        if (typeof(_output_result[_file_name][_m][_option_index]) === "undefined") {
                            _output_result[_file_name][_m][_option_index] = [];
                        }
                        _output_result[_file_name][_m][_option_index][_d] = _result;

                        //console.log(_result);
                        
                        //sleep.sleep(1); // sleep for ten seconds
                        
                    }   //for (var _d = 0; _d < 2; _d++) {
                    
                    if (_index_too_large === true) {
                        break;
                    }
                    
                    if (_debug === true) {
                        //break;  // 測試用，加快處理速度
                    }
                }   // for (var _m = 0; _m < 2; _m++) {
                _option_index++;
                
                // 測試用，加快處理速度
                if (_debug === true && _option_index > 1) {
                    //break;
                }
            }   
        }

        return _output_result;
    },

    parsing_raw_result: function (_raw_result) {
        var _result = {};
        
        for (var _file_name in _raw_result) {
            _result[_file_name] = {};
            for (var _m = 0; _m < _raw_result[_file_name].length; _m++) {
                var _file_result = _raw_result[_file_name][_m];
                var _option_value_mapping = {};

                // 先試著取出RHS吧，噢對了，我想要畫caption
                for (var _option_index = 1; _option_index < _file_result.length; _option_index++) {
                    var _option_result_l = _file_result[_option_index][0];
                    //if (typeof(_result[_file_name]["__target_attribute"]) === "undefined") {
                    //    var _target_attribute = substr_wrap(_option_result_l, "Target attribute: ", "\n");
                    //    _result[_file_name]["__target_attribute"] = _target_attribute;
                    //}
                    var _target_value = substr_wrap(_option_result_l, "Target value: ", "[");
                    _option_value_mapping[_target_value] = _option_index;
                }

                // 排序
                _option_value_mapping = json_sort_by_key(_option_value_mapping);
                //console.log(_option_value_mapping);

                for (var _target_value in _option_value_mapping) {
                    _option_index = _option_value_mapping[_target_value];
                    var _raw_result_tree = _file_result[_option_index][0];
                    var _result_tree = this.parsing_raw_result_tree(_raw_result_tree);
                    //console.log("====================");
                    //console.log(_target_result_tree);
                    
                    var _raw_result_rule = _file_result[_option_index][1];
                    var _result_rule = this.parsing_raw_result_rule(_raw_result_rule);
                    //console.log("====================");
                    //console.log(_result_rule);
                    
                    // 合併兩者
                    
                    for (var _i = 0; _i < _result_tree.lhs.length; _i++) {
                        for (var _indication in _result_rule[_i]) {
                            _result_tree.lhs[_i][_indication] = _result_rule[_i][_indication];
                        }
                    }
                    
                    var _direction = "max";
                    if (_m === 1) {
                        _direction = "min";
                    }
                    if (typeof(_result[_file_name][_direction]) === "undefined") {
                        _result[_file_name][_direction] = [];
                    }
                    
                    _result[_file_name][_direction].push(_result_tree);
                    
                    //console.log(_result_tree);
                }
            }
        }
        
        return _result;
    },
    
    parsing_raw_result_tree: function (_raw_result_tree) {
        var _result = {};
        
        // 先找出最主要的分析結果內容
        var _pos = _raw_result_tree.lastIndexOf("Minimum improvement in target: ");
        _pos = _raw_result_tree.indexOf("%", _pos);
        var _evaluation_pos = _raw_result_tree.lastIndexOf("=== Evaluation ===");
        if (_evaluation_pos === -1) {
            _evaluation_pos = _raw_result_tree.length;
        }
        
        var _main_raw_result = _raw_result_tree.substring(_pos+1, _evaluation_pos).trim();
        
        // -------------------
        var _target_data = {};
        
        _result["rhs"] = this.parsing_raw_result_tree_rhs(_main_raw_result);
        
        // --------------------
        
        var _rules_raw_result = substr_wrap(_main_raw_result, "  ").split("\n");
        
        _result["lhs"] = this.parsing_raw_result_tree_lhs(_rules_raw_result);
        
        return _result;
    },
    
    parsing_raw_result_tree_rhs: function (_main_raw_result) {
        var _target_data = {};
        
        _target_data["attribute"] = _main_raw_result.substr(0, _main_raw_result.indexOf("=")).trim();
        _target_data["value"] = substr_wrap(_main_raw_result, "=", " ");
        _target_data["match_instances"] = substr_wrap(_main_raw_result, "[", "/");
        _target_data["match_instances"] = parseInt(_target_data["match_instances"], 10);
        _target_data["population"] = substr_wrap(_main_raw_result, "/", "]");
        _target_data["population"] = parseInt(_target_data["population"], 10);
        
        return _target_data;
    },
    
    parsing_raw_result_tree_lhs: function (_rules_raw_result) {
        var _rules = [];
        //var _last_rule_length = 0;
        for (var _l = 0; _l < _rules_raw_result.length; _l++) {
            var _rule_data = {};
            var _line = _rules_raw_result[_l].trim();
            
            // 決定層數
            var _level_needle = "|   ";
            _rule_data["length"] = _line.split(_level_needle).length - 1;
            
            var _rule_line = _line;
            while (_rule_line.substr(_level_needle) === 0) {
                _rule_line = _rule_line.substring(_level_needle.length, _rule_line.length);
            }
            
            // temperature > 70 (100% [2/2])
            
            // 取出運算子
            var _ops_pos = _rule_line.indexOf(">");
            if (_ops_pos === -1 
                    || (_ops_pos !== -1 
                        && _rule_line.indexOf("<") !== -1
                        && _rule_line.indexOf("<") < _ops_pos) ) {
                _ops_pos = _rule_line.indexOf("<");
            }
            if (_ops_pos === -1 
                    || (_ops_pos !== -1 
                    && _rule_line.indexOf("=") !== -1
                    && _rule_line.indexOf("=") < _ops_pos) ) {
                _ops_pos = _rule_line.indexOf("=");
            }
            var _operator = _rule_line.substring(_ops_pos, _rule_line.indexOf(" ", _ops_pos)).trim();
            
            // 取出欄位名稱
            _rule_data["attribute"] = _rule_line.substr(0, _ops_pos).trim();
            _rule_data["operator"] = _operator;
            
            // 取出數值
            var _space_pos = _rule_line.indexOf(" ", _ops_pos)+1;
            _rule_data["value"] = parseNumber(_rule_line.substring(_space_pos, _rule_line.indexOf(" ", _space_pos+1)));
            
            // 取出cover
            var _raw_rule_cover = _rule_line.substring(_rule_line.lastIndexOf("(")+1, _rule_line.length-1);
            _rule_data["cover"] = parseNumber(substr_wrap(_raw_rule_cover, "(", "%"));
            
            // 取出match_instances
            _rule_data["match_instances"] = parseNumber(substr_wrap(_raw_rule_cover, "[", "/"));
            
            // 取出population
            _rule_data["population"] = parseNumber(substr_wrap(_raw_rule_cover, "/", "]"));
            
            _rules.push(_rule_data);
        }
        return _rules;
    },
    
    parsing_raw_result_rule: function (_raw_result_rule) {
        var _result = {};
        
        // 先找出最主要的分析結果內容
        var _pos = _raw_result_rule.lastIndexOf("Minimum improvement in target: ");
        _pos = _raw_result_rule.indexOf("%", _pos);
        var _evaluation_pos = _raw_result_rule.lastIndexOf("=== Evaluation ===");
        if (_evaluation_pos === -1) {
            _evaluation_pos = _raw_result_rule.length;
        }
        
        var _main_raw_result = _raw_result_rule.substring(_pos+1, _evaluation_pos).trim();
        
        // -------------------
        
        var _rules_raw_result = _main_raw_result.split("\n");
        var _result = [];
        for (var _l = 0; _l < _rules_raw_result.length; _l++) {
            var _line = _rules_raw_result[_l];
            var _conf_needle = "<conf:(";
            var _conf_pos = _line.lastIndexOf(_conf_needle) + _conf_needle.length;
            var _rule_line = _line.substring(_conf_pos, _line.length);
            
            var _rule_data = {};
            // conf
            _rule_data["conf"] = parseNumber(_rule_line.substr(0, _rule_line.indexOf(")")));
            
            // lift
            _rule_data["lift"] = parseNumber(substr_wrap(_rule_line, ")> lift:(", ") lev:("));
           
            // lev
            _rule_data["lev"] = parseNumber(substr_wrap(_rule_line, ") lev:(", ") conv:("));
            
            // conv
            _rule_data["conv"] = parseNumber(substr_wrap(_rule_line, ") conv:(", ")"));
            
            _result.push(_rule_data);
        }
        
        return _result;
    },
    
    parsing_raw_result_right: function (_raw_result_right) {
        return _raw_result_right;
    }
};