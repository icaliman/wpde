const gulp = require("gulp");
const gulpLoadPlugins = require("gulp-load-plugins");

const plumberErrorHandler = require("../plumber-error-handler");

const $ = gulpLoadPlugins();

/**
 * Replace async.
 *
 * @param {string} str
 * @param {RegExp}  regex
 * @param {Function}  asyncFn
 * @return {*} Content with replaced patterns
 */
async function replaceAsync(str, regex, asyncFn) {
    const promises = [];
    str.replace(regex, (match, ...args) => {
        const promise = asyncFn(match, ...args);
        promises.push(promise);
    });
    const data = await Promise.all(promises);
    return str.replace(regex, () => data.shift());
}

async function replacePattern(cont, pattern) {
    if (pattern.match) {
        let matchEscaped = pattern.match.replace(
            /([.*+?^${}()|[\]/\\])/g,
            "\\$1"
        );

        // Match custom patterns
        if (matchEscaped.endsWith("\\*")) {
            matchEscaped = matchEscaped.replace("\\*", "[.\\w\\d_-]+");
        }

        const matchRegExp = new RegExp(`@@${matchEscaped}`, "g");

        if ("function" === typeof pattern.replacement) {
            cont = await replaceAsync(cont, matchRegExp, pattern.replacement);
        } else {
            cont = cont.replace(matchRegExp, pattern.replacement || "");
        }
    }
    return cont;
}

/**
 * Replace patterns.
 *
 * @param {string} cont
 * @param {Array}  patterns
 * @param {Function}  cb
 * @return {*} Content with replaced patterns
 */
function replacePatterns(cont, patterns, cb) {
    let index = 0;

    function _replace_next() {
        if (index >= patterns.length) {
            return cb(null, cont);
        }

        replacePattern(cont, patterns[index]).then((newCont) => {
            cont = newCont;
            index++;
            _replace_next();
        });
    }
    _replace_next();
}

module.exports = {
    label: "Template Files",
    isAllowed(cfg) {
        return cfg.template_files_src && cfg.template_files_dist;
    },
    fn: (isDev) => (cfg, cb) => {
        const patterns = Object.keys(cfg.template_files_variables)
            .filter(
                (k) => "undefined" !== typeof cfg.template_files_variables[k]
            )
            .map((k) => ({
                match: k,
                replacement: cfg.template_files_variables[k],
            }));

        if (!patterns.length) {
            cb();
            return null;
        }

        return gulp
            .src(cfg.template_files_src, cfg.template_files_src_opts)
            .pipe(
                $.plumber({
                    errorHandler: plumberErrorHandler,
                    inherit: isDev,
                })
            )
            .pipe($.if(isDev, $.changed(cfg.template_files_src)))
            .pipe($.change((cont, cb) => replacePatterns(cont, patterns, cb)))
            .pipe(gulp.dest(cfg.template_files_dist));
    },
};
