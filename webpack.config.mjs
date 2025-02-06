import path from "path";
import experiments from "webpack";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default [
    {
        mode: "production",
        entry: "./src/converter.ts",
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: 'bundle.js',
            library: { type: 'commonjs2' },
        },
        resolve: {
            extensions: [".ts", ".js"],
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: "ts-loader",
                    exclude: /node_modules/,
                },
                {
                    test: /\.hbs$/,
                    use: "handlebars-loader",
                }
            ],
        },
        experiments: {
            outputModule: true
        },
    },
    {
        mode: "production",
        entry: "./src/converter.ts",
        output:
        {
            path: path.resolve(__dirname, "dist"),
            filename: 'bundle.mjs',
            library: { type: 'module' }
        },
        resolve: {
            extensions: [".ts", ".js"],
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: "ts-loader",
                    exclude: /node_modules/,
                },
                {
                    test: /\.hbs$/,
                    use: "handlebars-loader",
                }
            ],
        },
        experiments: {
            outputModule: true
        },
    }
]