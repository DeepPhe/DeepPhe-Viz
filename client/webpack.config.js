// webpack.config.js
module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        chunkFormat: 'array-push', // specify the chunk format directly
    },
    target: 'web', // specify the target environment
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    // Add your browserslist configuration in package.json
};
