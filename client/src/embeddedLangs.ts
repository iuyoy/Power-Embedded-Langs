/*
* Embedded languages infomation: sign pattern pair, languageServer name
*/


// const embeddedSQL = new EmbeddedLanguage("", "");

// export enum ScannerState {
// 	/* Language recognize state */
// 	WithinExternalLanguage,
// 	WithinSQL,
// 	WithinHTML,
// 	WithinJavaScript,
// 	WithinCSS,
// 	WithinYAML
// }

// export enum TokenType {
// 	/* new language should be inserted after ExternalLanguage and before EOS */
// 	ExternalLanguage,
// 	SQL,
// 	HTML,
// 	JavaScript,
// 	CSS,
// 	YAML,
// 	EOS,
// 	Unknown
// }

// The order of EMBEDDED_LANGUAGES should be same as TokenType

export class Pattern {
	public begin: RegExp;
	public end: RegExp;
	constructor(pattern: { begin: RegExp, end: RegExp }) { this.begin = pattern.begin, this.end = pattern.end; };
}

export class EmbeddedLanguage {
	public name: string;
	public pattern: Pattern;
	public suffix: string;
	constructor(lang: {  name: string, pattern: { begin: RegExp, end: RegExp }, suffix: string }) {
		this.name = lang.name;
		this.pattern = new Pattern(lang.pattern);
		this.suffix = lang.suffix;
	}
}

export let EMBEDDED_LANGUAGES = [
	{
		"languageService": null,
		"languageServiceName": "vscode-html-languageservice",
		"name": "sql",
		"pattern": {
			"begin": /-- *(beginsql|begin-sql).*/i,
			"end": /-- *(endsql|end-sql).*/i,
		},
		"suffix": "sql"
	}, {
		"languageService": null,
		"languageServiceName": "vscode-html-languageservice",
		"name": "html",
		"pattern": {
			"begin": /<!-- *html.*-->/i,
			"end": /<!-- *!html.*-->/i
		},
		"suffix": "html"
	}, {
		"languageService": null,
		"languageServiceName": "vscode-html-languageservice",
		"name": "javascript",
		"pattern": {
			"begin": /\/\/ *js.*/i,
			"end": /\/\/ *!js.*/i
		},
		"suffix": "js"
	}, {
		"languageService": null,
		"languageServiceName": "vscode-html-languageservice",
		"name": "css",
		"pattern": {
			"begin": /\/\* *css.*\*\//i,
			"end": /\/\* *!css.*\*\//i
		},
		"suffix": "css"
	}, {
		"languageService": null,
		"languageServiceName": "",
		"name": "yaml",
		"pattern": {
			"begin": / /,
			"end": / /,
		},
		"suffix": "yaml"
	}
];
