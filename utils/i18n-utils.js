i18n = {
    localize: null,
    init: function () {
        var _locale = cfg.i18n.locale;
        var _csv_path = './i18n/' + _locale + ".csv";
        
        var _csv_file = fs.readFileSync(_csv_path, 'utf8');
        
        try {
            var _csv_object = csv_parse(_csv_file, {columns: true});
        }
        catch (_e) {
            throw  _csv_path + " format error: " + _e;
        }
        
        var _locale_data = {};
        for (var _i = 0; _i < _csv_object.length; _i++) {
            var _key = _csv_object[_i]["key"];
            var _translation = _csv_object[_i]["translation"];
            _locale_data[_key] = {};
            _locale_data[_key][_locale] = _translation;
        }
        this.localize = new Localize(_locale_data);
        this.localize.setLocale(_locale);
        
        return this;
    },
    /**
     * usage https://github.com/AGROSICA/node-localize
     * @returns {unresolved}
     */
    __: function () {
        // for (var i=0, numArgs = arguments.length; i<numArgs; i++){
        if (this.localize === null) {
            this.init();
        }
        return this.localize.translate.apply(this, arguments);
    }
};