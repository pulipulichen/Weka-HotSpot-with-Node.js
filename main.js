require('./require-packages.js');
cfg = ini.parseSync('./config.ini');

require('./lib/time-utils.js');
require('./lib/file-utils.js');
require('./lib/weka-hotspot-utils.js');
require('./lib/string-utils.js');
require('./lib/json-utils.js');
require('./lib/csv-utils.js');

var _input_files = get_input_files();
var _output_dir = './output/' + get_date_time();
//mkdir(_output_dir);

//console.log(_input_files);
//console.log(cfg);
//console.log(_exclude_files);
//console.log(_input_files);
/*
//var _weka_cmds = build_weka_hotspot_commands(_input_files, _output_dir);
//console.log(_weka_cmds);
//console.log(build_weka_hotspot_command(_input_files[0]));
var _hotspot_result_raw = WekaHotSpotUtils.run_commands(_input_files);
var _hotspot_result = WekaHotSpotUtils.parsing_raw_result(_hotspot_result_raw);
//console.log(_weka_result_raw);
*/

var _csv1 = CSVUtils.read(_input_files[0]);
var _group_json = CSVUtils.group_by_target_attribute(_csv1);
var _flat_json = CSVUtils.flat_attribute_data(_group_json);
var _types_json = CSVUtils.detect_attribute_type(_flat_json);
//console.log(_types_json);
var _group_json = CSVUtils.count_nominal_attribute_data(_group_json, _types_json);
console.log(_group_json);

