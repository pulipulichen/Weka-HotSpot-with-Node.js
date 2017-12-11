CacheUtils = {
    enable: true,
    cache_files: {},
    set: function (_key, _value) {
        if (this.enable === false) {
            return;
        } 
        var _cache = this.get_cache_file(_key);
        _cache.set(_key, _value);
    },
    get: function (_key) {
        var _cache = this.get_cache_file(_key);
        return _cache.get(_key);
    },
    key_to_file_name: function (_key) {
        // 用最後一個_作為判斷
        var _pos = _key.lastIndexOf("_");
        if (_pos === -1) {
            return _key;
        }
        else {
            return _key.substr(0, _pos);
        }
    },
    get_cache_file: function (_key) {
        var _file_name = this.key_to_file_name(_key);
        if (typeof(this.cache_files[_file_name]) === "undefined") {
            this.cache_files[_file_name] = node_file_cache.create({
                file: "./cache/" + _file_name + ".cache.json",
                life: cfg.cache.life
            });
        }
        return this.cache_files[_file_name];
    }
};

//cache = require('node-file-cache').create({
//    file: "node-file-cache.json",
//    life: 3600 * 24
//});