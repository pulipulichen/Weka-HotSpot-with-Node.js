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
        //for (var _i in _data) {
        //    _data[_i] = this.convert_to_template_json(_data[_i]);
        //}
        //TmpUtils.append(_data);
        var _template_path = "./templates/" + _template_name + ".html";
        var _template = fs.readFileSync(_template_path,'utf8');
        //console.log(_template);
        return Mustache.render(_template, _data);
    },
    render_stat_table: function (_stat_data) {
        //console.log(_target_attribute_options);
        var _thead = this.render("stat-table-thead", _stat_data);
        
        var _tbody_tr_array = [];
        for (var _attr in _stat_data["attributes"]) {
            var _type = _stat_data["attributes_type"][_attr];
            var _attr_data = _stat_data["attributes"][_attr];
            
            if (_type === "numeric") {
                _tbody_tr_array.push(this.render_stat_tr_numeric(_attr_data));
            }
            else if (_type === "nominal") {
                _tbody_tr_array.push(this.render_stat_tr_nominal(_attr_data));
            }
        }
        
        var _tbody = this.render("stat-table-tbody", {tr: _tbody_tr_array});
        
        return {
            thead: _thead,
            tbody: _tbody
        };
    },
    render_stat_tr_numeric: function (_attr_data) {
        return "<tr>numeric</tr>";
    },
    render_stat_tr_nominal: function (_attr_data) {
        return "<tr>nominal</tr>";
    },
};