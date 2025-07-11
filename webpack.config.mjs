import path from "path";
import { fileURLToPath } from "url";
import experiments from "webpack";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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