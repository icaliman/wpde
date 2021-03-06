const through2 = require("through2");
const rename = require("gulp-rename");
const path = require("path");
const fs = require("fs");

exports.namedWithPrefix = (prefix) => {
    return through2.obj(function (file, _, cb) {
        const parsed = path.parse(file.relative);

        file.named = path.join(prefix, parsed.dir, parsed.name);

        cb(null, file);
    });
};

exports.namedRemovePrefix = (prefix) => {
    return rename(function (file) {
        file.dirname = file.dirname.replace(new RegExp("^" + prefix + "/"), "");
        return file;
    });
};

exports.touch = () =>
    through2.obj(function (file, enc, cb) {
        if (file.stat) {
            const fileDate = new Date();

            file.stat.atime = file.stat.mtime = file.stat.ctime = fileDate;

            fs.utimes(file.path, fileDate, fileDate, function () {});
        }
        cb(null, file);
    });
