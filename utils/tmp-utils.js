TmpUtils = {
    path: "./tmp.html",
    append: function (_data) {
        if (typeof(_data) === "object") {
            _data = JSON.stringify(_data, null, 4);
        }
        _data = _data + "\n";
        fs.appendFileSync(this.path, _data);
    },
    remove: function () {
        if (fs.existsSync(this.path)) {
            fs.writeFile(this.path, "");
        }
    }
};