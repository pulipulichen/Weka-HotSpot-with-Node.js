TemplateUtils = {
    convert_to_template_json: function (_data) {
        if (Array.isArray(_data)) {
            var _array = [];
            for (var _i = 0; _i < _data.length; _i++) {
                var _element = _data[_i];
                if (typeof(_element["element"]) === "undefined") {
                    _element = {"element": this.convert_to_template_json(_element)};
                }
                _array.push(_element);
            }
            return _array;
        }
        else if (typeof(_data) === "object") {
            var _array = [];
            for (var _key in _data) {
                var _element_data = this.convert_to_template_json(_data[_key]);
                var _element = {
                    "key": _key,
                    "data": _element_data
                };
                _array.push(_element);
            }
            return _array;
        }
        else {
            return _data;
        }
    },
    render: function (_template_name, _data) {
        _data = this.convert_to_template_json(_data);
        var _template_path = "./templates/" + _template_name + ".html";
        var _template = fs.readFileSync(_template_path,'utf8');
        console.log(_template);
        return Mustache.render(_template, _data);
    }
};