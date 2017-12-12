$(function () {
    // 為item-display加上屬性
    $("table").each(function (_i, _table) {
        _table = $(_table);
        
        var _match_count = [];
        var _match_list = [];

        _table.find('.lhs-item-display').each(function (_i, _ele) {
            _ele = $(_ele);
            var _text = _ele.text();
            
            var _pos = _text.indexOf(" ");
            if (_pos === -1) {
                _pos = _text.indexOf("=");
            }
            
            var _field = _text.substr(0, _pos);
            
            _ele.attr('data-item-field', _field);

            if ($.inArray(_field, _match_count) === -1) {
                _match_count.push(_field);
            }
            else if ($.inArray(_field, _match_list) === -1) {
                _match_list.push(_field);
            }
        });

        // -------------------
        // 檢查第一個類型跟第二個類型有沒有重複的表格

        for (var _i in _match_list) {
            var _field = _match_list[_i];

            _table.find('.lhs-item-display[data-item-field="' + _field + '"]').addClass('match');
        }

        _table.find('.lhs-item-display[data-item-field]').click(function () {
            var _table = $(this).parents("table:first");
            if ($(this).hasClass("highlight")) {
                _table.find('.lhs-item-display[data-item-field]').removeClass("highlight");
                return;
            }
            
            _table.find('.lhs-item-display[data-item-field]').removeClass("highlight");

            var _field = $(this).attr("data-item-field");
            _table.find('.lhs-item-display[data-item-field="' + _field + '"]').addClass("highlight");
        });
    });
        
});