const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {
    const development = argv.mode == "development";
    const production = argv.mode == "production";

    let config = {
        mode: "production",
        entry:  "./src/client/index.ts",
        output: {
            filename: "x.[contenthash].js",
            path: path.resolve(__dirname, "build", "dist")
        },
        optimization: {
            splitChunks: {
                chunks: "all"
            }
        },
        resolve: {
            extensions: [
                ".ts", ".d.ts", ".tsx",
                ".js",
                ".css"
            ]
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    loader: "ts-loader"
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader
                        },
                        "css-loader"
                    ]
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "x.[contenthash].css"
            }),
            new HtmlWebpackPlugin({
                filename: "index.html",
                template: "src/client/html/index.html"
            })
        ]
    };

    if(development) {
        config.mode = "development";
        config.devtool = "eval-source-map";
    }

    if(production) {
        config.optimization = {
            minimizer: [
                new TerserJSPlugin({})
            ]
        };
    }

    return config;
};
