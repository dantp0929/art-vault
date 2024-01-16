module.exports = {
	"env": {
		"browser": true,
		"es2022": true
	},
	"extends": "standard-with-typescript",
	"overrides": [
		{
			"env": {
				"node": true
			},
			"files": [
				".eslintrc.{js,cjs}"
			],
			"parserOptions": {
				"sourceType": "script"
			}
		}
	],
	"parserOptions": {
		"ecmaVersion": "latest",
		"sourceType": "module"
	},
	"rules": {
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/strict-boolean-expressions": "off",
		"@typescript-eslint/no-floating-promises": "off"
	},
	"ignorePatterns": [".eslintrc.js", "node_modules*"]
}
