const taskClean = require("./clean");
const taskCopy = require("./copy");
const taskRemoteCopy = require("./remote-copy");
const taskPrefixScss = require("./prefix-scss");
const taskCompileScss = require("./compile-scss");
const taskCompileScssRtl = require("./compile-scss-rtl");
const taskCompileJs = require("./compile-js");
const taskCompileJsx = require("./compile-jsx");
const taskModernizr = require("./modernizr");
const taskTemplateFiles = require("./template-files");
const taskCorrectLineEndings = require("./correct-line-endings");
const taskTranslatePhp = require("./translate-php");
const taskZip = require("./zip");
const taskRsync = require("./rsync");

module.exports = {
    clean: taskClean,
    copy: taskCopy,
    remote_copy: taskRemoteCopy,
    prefix_scss: taskPrefixScss,
    compile_scss: taskCompileScss,
    compile_scss_rtl: taskCompileScssRtl,
    compile_js: taskCompileJs,
    compile_jsx: taskCompileJsx,
    modernizr: taskModernizr,
    template_files: taskTemplateFiles,
    correct_line_endings: taskCorrectLineEndings,
    translate_php: taskTranslatePhp,
    zip: taskZip,
    rsync: taskRsync,
};
