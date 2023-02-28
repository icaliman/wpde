const fs = require("fs");

// find config
let customConfig = false;
const customConfigPath = `${process.cwd()}/webpack.config.js`;
if (fs.existsSync(customConfigPath)) {
    // eslint-disable-next-line global-require
    customConfig = require(customConfigPath);
}

module.exports = function (isDev = false) {
    return {
        cache: {
            type: "filesystem",
        },
        mode: "production", //isDev ? "development" : "production",
        optimization: {
            minimize: false,
        },
        stats: "minimal",
        target: ["web", "es5"],
        devtool: isDev ? "inline-source-map" : false,
        module: {
            rules: [
                {
                    test: /\.(jsx|js)$/i,
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/env"],
                        cacheDirectory: true,
                        cacheCompression: false,
                    },
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: "style-loader", // creates style nodes from JS strings
                        },
                        {
                            loader: "css-loader", // translates CSS into CommonJS
                            options: {
                                url: false,
                            },
                        },
                        { loader: "postcss-loader" },
                        {
                            loader: "sass-loader", // compiles Sass to CSS
                        },
                    ],
                },
            ],
        },
        ...("function" === typeof customConfig
            ? customConfig(isDev)
            : customConfig || {}),
    };
};
