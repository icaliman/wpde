const through2 = require("through2");
const Spinnies = require("spinnies");
const rename = require("gulp-rename");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const prettyHrtime = require("pretty-hrtime");
const esbuild = require("esbuild");

const { time } = require("./notices");

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

exports.esbuild = (dir) =>
    through2.obj(async function (file, enc, cb) {
        esbuild
            .build({
                entryPoints: [file.path],
                bundle: true,
                outdir: dir,
            })
            .then(cb(null, file));
    });

exports.touch = () =>
    through2.obj(function (file, enc, cb) {
        if (file.stat) {
            const fileDate = new Date();

            file.stat.atime = file.stat.mtime = file.stat.ctime = fileDate;

            fs.utimes(file.path, fileDate, fileDate, function () {});
        }
        cb(null, file);
    });

const currentLogs = {};
const spinnies = new Spinnies({ color: "white", succeedColor: "white" });

function endCount(name, count) {
    if (currentLogs[name]) {
        spinnies.succeed(name, {
            text: [
                time(),
                " ",
                chalk.blue(name || ""),
                ": ",
                chalk.green(count + " files"),
                " after ",
                chalk.red(prettyHrtime(process.hrtime(currentLogs[name]))),
            ].join(""),
        });
        delete currentLogs[name];
    }
}
function startCount(name) {
    // Already running
    if (currentLogs[name]) {
        endCount(name);
    }

    // Create new log
    spinnies.add(name, {
        text: [time(), " ", chalk.blue(name || "")].join(""),
    });
    currentLogs[name] = process.hrtime();
}

exports.count = (message) => {
    let count = 0;

    startCount(message);

    return through2.obj(
        function (file, enc, cb) {
            count++;

            cb(null, file);
        },
        function (cb) {
            endCount(message, count);

            cb();
        }
    );
};
