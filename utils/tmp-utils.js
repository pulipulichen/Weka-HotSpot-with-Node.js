TmpUtils = {
    path: "./tmp.txt",
    append: function (_data) {
        if (typeof(_data) === "object") {
            _data = JSON.stringify(_data);
        }
        fs.appendFileSync(this.path, _data);
    },
    remove: function () {
        if (fs.existsSync(this.path)) {
            fs.unlinkSync(this.path);
        }
    }
};