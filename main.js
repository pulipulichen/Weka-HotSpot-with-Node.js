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

require('./utils/stat/kruskal-wallis-h-test-utils.js');
require('./lib/python/dunn/dunn-python.js');
require('./lib/python/kruskal/kruskal-python.js');

var Main = {
    exec: function () {
        
        this.setup_data();
        if (this.data.input_files.length === 0) {
            throw "No input file.";
        }
        
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
        
        var _output_dir = cfg.file.output_dir +  '/result/';
        if (parseNumber(cfg.file.append_date_to_output_dir) === true) {
            _output_dir = cfg.file.output_dir + "/" + get_date_time();
        }
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
        
        console.log("\n======================\n");
        console.log("Statistic analyse\n");
        var _stat_data = {};
        for (var _i = 0; _i < this.data.input_files.length; _i++) {
            
            var _file_path = this.data.input_files[_i];
            var _file_name = path.basename(_file_path, '.csv');
            
            console.log("\nFile [" + (_i+1) + "/" + this.data.input_files.length + "] :" + _file_name + "\n");
            
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
        
        console.log("\n======================\n");
        console.log("Hotspot analyse\n");
        var _hotspot_result_raw = WekaHotSpotUtils.run_commands(this.data.input_files, this.data.stat);
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
                            if (typeof(_attr_stat["anova"]) !== "undefined") {
                                _test = _attr_stat["anova"];
                            }
                            else if (typeof(_attr_stat["kw-h-test"]) !== "undefined") {
                                _test = _attr_stat["kw-h-test"];
                            }
                            _comparison = _attr_stat["post-hoc"][_group];
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
                "stat": this.data.stat[_file_name],
                "hotspot": this.data.hotspot[_file_name]
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
            
            _r["hotspot_table"] = {};
            for (var _direction in _render[_file_name]["hotspot"]) {
                var _hotspot_data = _render[_file_name]["hotspot"][_direction];
                //console.log([_direction, _hotspot_data]);
                _r["hotspot_table"][_direction] = TemplateHotspotTable.render_hotspot_table(_file_name, _direction, _hotspot_data);
            }
                
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
            var _body_html = [_file_json.stat_table];
            for (var _direction in _file_json.hotspot_table) {
                _body_html.push(_file_json.hotspot_table[_direction]);
            }
            _body_html = _body_html.join("<hr />");
            
            var _single_report_json = {
                "file_name": _file_name,
                "date": get_date_time(),
                "body_html": _body_html
            };
            _single_report.push(_single_report_json);
            fs.writeFileSync(_path, TemplateUtils.render("single-report", _single_report_json));
        }
        
        var _full_report_path = _output_dir + "/" + "full-report" + ".html";
        fs.writeFileSync(_full_report_path, TemplateUtils.render("full-report", {
            "date": get_date_time(),
            "single-report": _single_report
        }));
        
        // ----------------------
        
        // 複製其他檔案過去
        var _style_files = get_style_files();
        
        for (var _i = 0; _i < _style_files.length; _i++) {
            var _from_file = cfg.file.output_style_dir + "/" + _style_files[_i];
            var _to_file = _output_dir + "/" + _style_files[_i];
            //console.log([_from_file, _to_file]);
            fs.createReadStream(_from_file).pipe(fs.createWriteStream(_to_file));
        }
        
        // 移動來源檔案過去
        if (parseNumber(cfg.file.move_files_after_analyzing) === true) {
            var _input_files = this.data.input_files;
            for (var _i = 0; _i < _input_files.length; _i++) {
                var _from_file = _input_files[_i];
                var _file_name = path.basename(_from_file, '.csv');
                var _to_file = _output_dir + "/" + _file_name + ".csv";
                fs.rename(_from_file, _to_file);
            }
        }
    }
};

TmpUtils.remove();
Main.exec();

/*
a = [0.28551035, 0.338524035, 0.088631321, 0.205930807, 0.363240102]
b = [0.52173913, 0.763358779, 0.325436786, 0.425305688, 0.378071834]
c = [0.98911968, 1.192718142, 0.788288288, 0.549176236, 0.544588155]
d = [1.26705653, 1.625320787, 1.266108976, 1.154187629, 1.268489431]
e = [1.25697569, 1.265897356, 1.237814561, 0.954612564, 2.365415457]

console.log(KruskalWallisHtestUtils.analyze({
    a: a, b: b, c: c, d:d, e:e
}));
*/

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