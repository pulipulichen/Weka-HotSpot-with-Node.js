$(function () {
    $("tr[data-lhs-attr]").click(function () {
        //console.log(111);
        var _tr = $(this);
        var _lhs_attr = _tr.attr("data-lhs-attr");
        var _file_name = _tr.parents("table:first").attr("data-file-name");
        
        var _highlight_classname = "highlight";
        var _is_cancel = _tr.hasClass(_highlight_classname);
        $('table[data-file-name="' + _file_name +'"] .' + _highlight_classname).removeClass(_highlight_classname);
        
        if (_is_cancel) {
            return;
        }
        
        var _highlight_tr = $('table[data-file-name="' + _file_name +'"] tr[data-lhs-attr="' + _lhs_attr + '"]');
        _highlight_tr.addClass(_highlight_classname);
        //console.log(_highlight_tr.length);
    });
});