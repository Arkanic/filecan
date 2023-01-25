const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "production",
    optimization: {
        minimizer: [
            new TerserJSPlugin({})
        ]
    },
    entry: {
        index: "./src/client/client/index.js",
        admin: "./src/client/admin/index.js"
    },
    output: {
        filename: "[name]/x.[contenthash].js",
        path: path.resolve(__dirname, "dist")
    },
    optimization: {
        splitChunks: {
            chunks: "all"
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
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
            filename: "index/index.html",
            template: "src/client/client/html/index.html",
            chunks: ["index"]
        }),
        new HtmlWebpackPlugin({
            filename: "admin/index.html",
            template: "src/client/admin/html/index.html",
            chunks: ["admin"]
        }),
        new CleanWebpackPlugin()
    ]
};
