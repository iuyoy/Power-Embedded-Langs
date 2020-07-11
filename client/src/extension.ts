/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import { commands, CompletionList, ExtensionContext, Uri, workspace, DocumentSelector } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind, WorkspaceChange } from 'vscode-languageclient';
import { recognizeEmbeddedLanguage, extractVirtualContent } from './embeddedSupport';
import { TokenType, EMBEDDED_LANGUAGES, enabledEmbeddedLangs, EmbeddedLanguage } from './embeddedLangs';
import { debug } from 'console';
import { isNull } from 'util';
// import {} from 'SQL Language Basics';


const EXTENSION_NAME = "power-embedded-langs";
const CONFIGURATION_SECTION = "PEL";

let client: LanguageClient;

function initialize() {
	const enabledEmbeddedLanguages: Array<string> = workspace.getConfiguration(CONFIGURATION_SECTION).get('enabledEmbeddedLanguages');
	const enabledExternalLanguages: Array<string> = workspace.getConfiguration(CONFIGURATION_SECTION).get('enabledExternalLanguages');
	console.log("Enabled Embedded Lang Configure:", enabledEmbeddedLanguages);
	console.log("Enabled External Lang Configure:", enabledExternalLanguages);

	let documentSelectors = enabledExternalLanguages.map(function (langs) {
		return { scheme: 'file', language: langs };
	});

	console.log(documentSelectors);
	for (var lang of EMBEDDED_LANGUAGES) {
		if (enabledEmbeddedLanguages.find(name => name === lang.name)) {
			// TODO: change to import when recognizing such language.
			if (lang.languageServiceName !== "") {
				const loadingLang = lang;
				import(loadingLang.languageServiceName).then(
					languageServer => {
						const languageService = languageServer.getLanguageService();
						lang.languageService = languageService;
						console.log(`Token ${loadingLang.token} load ${loadingLang.languageServiceName} success`);
						enabledEmbeddedLangs.push(new EmbeddedLanguage(loadingLang));
					}
				).catch(err => {
					console.warn(`Failed to load ${loadingLang.name}'s language service ${loadingLang.languageServiceName}, disable this lang.`);
				});
			}
		}
	}
	return documentSelectors;
}


export function activate(context: ExtensionContext) {
	const ds = initialize();
	// The server is implemented in node
	let serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	const virtualDocumentContents = new Map<string, string>();

	workspace.registerTextDocumentContentProvider('embedded-content', {
		provideTextDocumentContent: uri => {
			const originalUri = uri.path.slice(1).slice(0, uri.path.lastIndexOf('.') - uri.path.length);
			const decodedUri = decodeURIComponent(originalUri);
			return virtualDocumentContents.get(decodedUri);
		}
	});

	let clientOptions: LanguageClientOptions = {
		documentSelector: ds,//[{ scheme: 'file', language: '*' }],
		middleware: {
			provideCompletionItem: async (document, position, context, token, next) => {
				// If it is not in any embedded language code region, do not perform request forwarding
				// const region = judgeLanguageRegion(document.getText(), document.offsetAt(position));
				const lang = recognizeEmbeddedLanguage(document, position);
				if (isNull(lang)) {
					return await next(document, position, context, token);
				}
				// let languageService = languageServices[TokenType[lang]];


				const originalUri = document.uri.toString();
				// virtualDocumentContents.set(originalUri, getCSSVirtualContent(lang.languageService, document.getText()));
				virtualDocumentContents.set(originalUri, extractVirtualContent(document, lang));

				const uriString = `embedded-content://${lang.name}/${encodeURIComponent(originalUri)}.${lang.suffix}`;
				const vdocUri = Uri.parse(uriString);
				return await commands.executeCommand<CompletionList>(
					'vscode.executeCompletionItemProvider',
					vdocUri,
					position,
					context.triggerCharacter
				);
			}
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'PowerEmbeddedLangsServer',
		'Power Embedded Language Server',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
