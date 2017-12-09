// npm install package-name
fs = require('fs');
path = require('path');
ini = require('node-ini');
shell = require('shelljs');
sleep = require('sleep');

// npm install csv
csv_parse = require('csv-parse/lib/sync');

// npm install --save jStat
jStat = require('jStat').jStat;

// npm install anova
anova = require('anova');

// npm install mustache --save
Mustache = require('mustache');

// npm install node-file-cache --save
cache = require('node-file-cache').create({
    file: "node-file-cache.json"
});