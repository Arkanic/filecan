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
            path: path.resolve(__dirname, "build", "dist"),
            assetModuleFilename: "x.[contenthash][ext]"
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
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    type: "asset/resource"
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: "asset/resource"
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "x.[contenthash].css"
            }),
            new HtmlWebpackPlugin({
                filename: "index.html",
                template: "src/client/content/index.html",
                icons: require("./src/client/font/icons")
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
