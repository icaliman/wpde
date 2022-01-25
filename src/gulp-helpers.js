const through2 = require("through2");
const rename = require("gulp-rename");

exports.namedWithPrefix = (prefix) => {
    return through2.obj(function (file, _, cb) {
        const parsed = path.parse(file.relative);

        file.named = path.join(prefix, parsed.dir, parsed.name);

        cb(null, file);
    });
};

exports.namedRemovePrefix = (prefix) => {
    return rename(function (path) {
        path.dirname = path.dirname.replace(new RegExp("^" + prefix + "/"), "");
        return path;
    });
};
