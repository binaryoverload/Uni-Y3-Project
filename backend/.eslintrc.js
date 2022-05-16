module.exports = {
    env: {
        commonjs: true,
        es2021: true,
        node: true,
    },
    extends: ["eslint:recommended", "prettier"],
    parserOptions: {
        ecmaVersion: 13,
    },
    rules: {
        quotes: [2, "double", { avoidEscape: true }],
        "no-unused-vars": 1,
    },
}
