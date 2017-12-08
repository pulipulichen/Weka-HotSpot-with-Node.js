fs = require('fs');
path = require('path');
const ini = require('node-ini');
cfg = ini.parseSync('./config.ini');
shell = require('shelljs');
sleep = require('sleep');

require('./lib/time-utils.js');
require('./lib/file-utils.js');
require('./lib/weka-utils.js');

var _input_files = get_input_files();
var _output_dir = './output/' + get_date_time();
mkdir(_output_dir);

//console.log(_input_files);
//console.log(cfg);
//console.log(_exclude_files);
//console.log(_input_files);

//var _weka_cmds = build_weka_hotspot_commands(_input_files, _output_dir);
//console.log(_weka_cmds);
//console.log(build_weka_hotspot_command(_input_files[0]));
run_weka_hotspot_commands(_input_files);