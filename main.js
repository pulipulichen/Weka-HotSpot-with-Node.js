require('./require-packages.js');
cfg = ini.parseSync('./config.ini');

require('./utils/time-utils.js');
require('./utils/file-utils.js');
require('./utils/weka-hotspot-utils.js');
require('./utils/string-utils.js');
require('./utils/json-utils.js');
require('./utils/csv-utils.js');
require('./utils/stat/chisquare-utils.js');
require('./utils/stat/anova-utils.js');
require('./lib/statistics-distributions.js');

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

/*
var _csv1 = CSVUtils.read(_input_files[0]);
var _group_json = CSVUtils.group_by_target_attribute(_csv1);
var _flat_json = CSVUtils.flat_attribute_data(_group_json);
var _types_json = CSVUtils.detect_attribute_type(_flat_json);
//console.log(_types_json);
var _group_json = CSVUtils.count_nominal_attribute_data(_group_json, _types_json);
var _group_json = CSVUtils.stat.analyse(_group_json, _types_json);
console.log(_group_json);
*/

/*
var _data = [
    [2,1,1,2,3,1,1,2,2,1],
    [2,2,3,2,2,2,3],
    [2,3,3,2,3,2,3,3,3]];

var _df1 = 2;
var _df2 = 23;
var _f_score = anova.test(_data);
var _p_value = jStat.ftest(_f_score, _df1, _df2);
//jstat_obj = jStat(_data);
//console.log(jstat_obj.anovafscore());
console.log(jStat.tukeyhsd(_data));
*/

var _data = {
    "male": {
        "item1": 6,
        "item2": 5,
        "item3": 9,
        "item4": 4
    },
    "female": {
        "item1": 16,
        "item2": 5,
        "item3": 4,
        "item4": 1
    }
};
console.log(ChiSquareUtils.analyze(_data));