require('./require-packages.js');
cfg = ini.parseSync('./config.ini');

require('./utils/time-utils.js');
require('./utils/file-utils.js');
require('./utils/weka-hotspot-utils.js');
require('./utils/string-utils.js');
require('./utils/json-utils.js');
require('./utils/csv-utils.js');
require('./utils/tmp-utils.js');
require('./utils/cache-utils.js');
require('./utils/stat/anova-utils.js');
require('./utils/stat/contingency-table/chisquare-utils.js');
require('./utils/stat/contingency-table/fisher-exact-test.js');
require('./utils/stat/contingency-table/tau.js');
require('./lib/statistics-distributions.js');
require('./utils/template-utils.js');
require('./utils/template/stat-table.js');
require('./utils/template/hotspot-table.js');
require('./utils/i18n-utils.js');

var Main = {
    exec: function () {
        
        this.setup_data();
        this.setup_cache();
        this.stat();
        this.hotspot();
        this.setup_view();
        
        
        this.render();
        //TmpUtils.append(this.data.render["example_input-weather.numeric"].hotspot_max_table);
        
        console.log("======================");
        console.log("Finish!");
    },
    data: {},
    setup_data: function () {
        var _input_files = get_input_files();
        var _output_dir = './output/' + get_date_time();
        this.data.input_files = _input_files;
        this.data.output_dir = _output_dir;
    },
    setup_cache: function () {
        var _cache_key = [];
        for (var _i = 0; _i < this.data.input_files.length; _i++) {
            var _path_name = this.data.input_files[_i];
            var _file_name = path.basename(_path_name, '.csv');
            _cache_key.push(_file_name);
        }
        this.data.cache_key = _cache_key.join(",");
    },
    stat: function () {
        var _cache_key = this.data.cache_key + "_stat";
        this.data.stat = CacheUtils.get(_cache_key);
        if (this.data.stat !== null) {
            return;
        }
        
        var _stat_data = {};
        for (var _i = 0; _i < this.data.input_files.length; _i++) {
            var _file_path = this.data.input_files[_i];
            var _file_name = path.basename(_file_path, '.csv');
            var _csv1 = CSVUtils.read(_file_path);
            var _target_attr = CSVUtils.get_target_attribute(_csv1);
            var _group_json = CSVUtils.group_by_target_attribute(_csv1);
            
            //Wconsole.log(_group_json);
            var _target_attribute_options = [];
            for (var _attr in _group_json) {
                for (var _option in _group_json[_attr]) {
                    _target_attribute_options.push(_option);
                }
                break;
            }
            //this.data.target_attribute_options[_file_name] = _target_attribute_options;

            var _flat_json = CSVUtils.flat_attribute_data(_group_json);
            var _types_json = CSVUtils.detect_attribute_type(_flat_json);
            //this.data.attributes_type[_file_name] = _types_json;

            //console.log(_types_json);
            var _group_json = CSVUtils.count_nominal_attribute_data(_group_json, _types_json);
            var _group_json = CSVUtils.stat.analyse(_group_json, _types_json);
            
            _stat_data[_file_name] = {
                target_attribute: _target_attr,
                target_attribute_options: _target_attribute_options,
                attributes_type: _types_json,
                attributes: _group_json
            };
        }
        this.data.stat = _stat_data;
        
        CacheUtils.set(_cache_key, _stat_data);
        //console.log(_group_json);
    },
    hotspot: function () {
        var _cache_key = this.data.cache_key + "_hotspot";
        this.data.hotspot = CacheUtils.get(_cache_key);
        if (this.data.hotspot !== null) {
            return;
        }
        
        var _hotspot_result_raw = WekaHotSpotUtils.run_commands(this.data.input_files);
        var _hotspot_result = WekaHotSpotUtils.parsing_raw_result(_hotspot_result_raw);
        this.data.hotspot = _hotspot_result;
        this.add_stat_to_hotspot();
        
        CacheUtils.set(_cache_key, _hotspot_result);
    },
    add_stat_to_hotspot: function () {
        //console.log(this.data.hotspot)
        
        var _stat = this.data.stat;
        var _hotspot = this.data.hotspot;
        //var _types = this.data.attributes_type;
        for (var _file_name in _hotspot) {
            for (var _direction in _hotspot[_file_name]) {
                for (var _r = 0; _r < _hotspot[_file_name][_direction].length; _r++) {
                    var _rules = _hotspot[_file_name][_direction][_r];
                    var _group = _rules.rhs.value;
                    var _types = _stat[_file_name]["attributes_type"];
                    for (var _l = 0; _l < _rules.lhs.length; _l++) {
                        var _attr = _rules.lhs[_l].attribute;
                        var _value = _rules.lhs[_l].value;
                        var _attr_stat = _stat[_file_name]["attributes"][_attr];
                        var _type = _types[_attr];

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
    },
    setup_view: function () {
        var _cache_key = this.data.cache_key + "_view";
        this.data.view = CacheUtils.get(_cache_key);
        if (this.data.view !== null) {
            return;
        }
        
        var _view = {};
        for (var _file_name in this.data.stat) {
            _view[_file_name] = {
                stat: this.data.stat[_file_name],
                hotspot: {
                    max: this.data.hotspot[_file_name]["max"],
                    min: this.data.hotspot[_file_name]["min"]
                }
            };
        }
        this.data.view = _view;
        
        CacheUtils.set(_cache_key, _view);
    },
    render: function () {
        var _render = this.data.view
        for (var _file_name in _render) {
            var _r = {};
            var _stat_data = _render[_file_name]["stat"];
            _r["stat_table"] = TemplateStatTable.render_stat_table(_file_name, _stat_data);
            
            // render_hotspot: function (_file_name, _direction, _hotspot_json) {
            
            var _max_data = _render[_file_name]["hotspot"]["max"];
            _r["hotspot_max_table"] = TemplateHotspotTable.render_hotspot_table(_file_name, "Maximize", _max_data);
            
            var _min_data = _render[_file_name]["hotspot"]["min"];
            _r["hotspot_min_table"] = TemplateHotspotTable.render_hotspot_table(_file_name, "Minimize", _min_data);
            
            _render[_file_name] = _r;
        }
        
        this.data.render = _render;
        
        // -------------------
        // 輸出到個別的檔案
        var _single_report = [];
        var _output_dir = this.data.output_dir;
        mkdir(_output_dir);
        for (var _file_name in _render) {
            var _path = _output_dir + "/" + _file_name + ".html";
            var _file_json = _render[_file_name];
            var _body_html = _file_json.stat_table 
                            + "<hr />"
                            + _file_json.hotspot_max_table 
                            + "<hr />"
                            + _file_json.hotspot_min_table;
            var _single_report_json = {
                "file_name": _file_name,
                "date": get_date_time(),
                "body_html": _body_html
            };
            _single_report.push(_single_report_json);
            fs.writeFileSync(_path, TemplateUtils.render("single-report", _single_report_json));
        }
        
        var _full_report_path = _output_dir + "/" + "full-report-" + get_date_time() + ".html";
        fs.writeFileSync(_full_report_path, TemplateUtils.render("full-report", {
            "date": get_date_time(),
            "single-report": _single_report
        }));
        
        // 複製其他檔案過去
        var _style_files = get_style_files();
        
        for (var _i = 0; _i < _style_files.length; _i++) {
            var _from_file = "./output-style/" + _style_files[_i];
            var _to_file = _output_dir + "/" + _style_files[_i];
            fs.createReadStream(_from_file).pipe(fs.createWriteStream(_to_file));
        }
    }
};

TmpUtils.remove();
Main.exec();

//console.log(i18n.__("welcome $[1]", "布丁"));

//console.log(jStat.tukeyhsd([
//    [70,83,68,64,69],[85,80,65,72,71,75,75,72,81]
//]))

//cache.init({'ttl':10000});
/*
console.log(cache.get("key"));
item = {
    name: 'my cache item'
};
cache.set("key", item);
*/

/*
var view = {
  title: "Joe",
  calc: function () {
    return 2 + 4;
  }
};

var output = Mustache.render("{{ title }} spends {{ calc }}", view);
console.log(output);
*/

/*
var _data = ChiSquareUtils.example_data;
var _result = TemplateUtils.render("test", {ct: _data});
//TmpUtils.append(TemplateUtils.convert_to_template_json(_data));
console.log(_result);
TmpUtils.append(_result);
*/