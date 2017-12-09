require('./require-packages.js');
cfg = ini.parseSync('./config.ini');

require('./utils/time-utils.js');
require('./utils/file-utils.js');
require('./utils/weka-hotspot-utils.js');
require('./utils/string-utils.js');
require('./utils/json-utils.js');
require('./utils/csv-utils.js');
require('./utils/tmp-utils.js');
require('./utils/stat/anova-utils.js');
require('./utils/stat/contingency-table/chisquare-utils.js');
require('./utils/stat/contingency-table/fisher-exact-test.js');
require('./utils/stat/contingency-table/tau.js');
require('./lib/statistics-distributions.js');

var Main = {
    exec: function () {
        TmpUtils.remove();
        this.setup_data();
        this.stat();
        this.hotspot();
        this.add_stat_to_hotspot();
    },
    data: {},
    setup_data: function () {
        var _input_files = get_input_files();
        var _output_dir = './output/' + get_date_time();
        this.data.input_files = _input_files;
        this.data.output_dir = _output_dir;
    },
    stat: function () {
        var _csv1 = CSVUtils.read(this.data.input_files[0]);
        var _group_json = CSVUtils.group_by_target_attribute(_csv1);

        var _flat_json = CSVUtils.flat_attribute_data(_group_json);
        var _types_json = CSVUtils.detect_attribute_type(_flat_json);
        this.data.attributes_type = _types_json;

        //console.log(_types_json);
        var _group_json = CSVUtils.count_nominal_attribute_data(_group_json, _types_json);
        var _group_json = CSVUtils.stat.analyse(_group_json, _types_json);
        this.data.stat = _group_json;
        //console.log(_group_json);
    },
    hotspot: function () {
        var _hotspot_result_raw = WekaHotSpotUtils.run_commands(this.data.input_files);
        var _hotspot_result = WekaHotSpotUtils.parsing_raw_result(_hotspot_result_raw);
        this.data.hotspot = _hotspot_result;
    },
    add_stat_to_hotspot: function () {
        //console.log(this.data.hotspot)
        TmpUtils.append(this.data.stat);
        
        var _stat = this.data.stat;
        var _hotspot = this.data.hotspot;
        var _types = this.data.attributes_type;
        for (var _file_name in _hotspot) {
            for (var _direction in _hotspot[_file_name]) {
                for (var _r = 0; _r < _hotspot[_file_name][_direction].length; _r++) {
                    var _rules = _hotspot[_file_name][_direction][_r];
                    var _group = _rules.rhs.value;

                    for (var _l = 0; _l < _rules.lhs.length; _l++) {
                        var _attr = _rules.lhs[_l].attribute;
                        var _value = _rules.lhs[_l].value;
                        var _type = _types[_attr];
                        var _attr_stat = _stat[_attr];

                        var _test, _comparison;

                        if (_type === "numeric") {
                            _test = _attr_stat["anova"];
                            _comparison = _attr_stat["tukeyhsd"][_group];
                        }
                        else if (_type === "nominal") {
                            _test = _attr_stat["chi-square"];
                            _comparison = _attr_stat["cell"][_group][_value];
                        }
                        
                        _rules.lhs[_l]["test"] = _test;
                        _rules.lhs[_l]["comparison"] = _comparison;
                    }   // for (var _l = 0; _l < _rules.lhs.length; _l++) {
                }   // for (var _r = 0; _r < this.data.hotspot[_file_name][_direction].length; _r++) {
            }   // for (var _direction in this.data.hotspot[_file_name]) {
        }   // for (var _file_name in this.data.hotspot) {
        
        TmpUtils.append(this.data.hotspot);
    }
};

Main.exec();


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
/*
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
*/
//console.log(Tau.y2x(_data));

