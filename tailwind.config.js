const fs = require("fs");

// find config
let customConfig = false;
const customConfigPath = `${process.cwd()}/tailwind.config.js`;
if (fs.existsSync(customConfigPath)) {
    // eslint-disable-next-line global-require
    customConfig = require(customConfigPath);
}

module.exports = customConfig;
