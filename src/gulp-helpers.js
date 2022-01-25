const through2 = require("through2");
const rename = require("gulp-rename");
const path = require("path");

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
