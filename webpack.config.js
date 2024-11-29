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
    entry:  "./src/client/index.ts",
    output: {
        filename: "x.[contenthash].js",
        path: path.resolve(__dirname, "dist")
    },
    optimization: {
        splitChunks: {
            chunks: "all"
        }
    },
    resolve: {
        extensions: [
            ".ts", ".tsx",
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
        }),
        new CleanWebpackPlugin()
    ]
};
