json_sort_by_key = function (unordered) {
    // https://stackoverflow.com/a/31102605/6645399
    Object.keys(unordered).sort().forEach(function(key) {
        ordered[key] = unordered[key];
    });
    return ordered;
};