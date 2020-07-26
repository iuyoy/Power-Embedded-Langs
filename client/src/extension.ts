/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import { commands, CompletionList, Hover, ExtensionContext, Uri, workspace, DocumentSelector } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind, WorkspaceChange } from 'vscode-languageclient';
import { recognizeEmbeddedLanguage, extractVirtualContent, generateVirtualContentUri } from './embeddedSupport';
import { EMBEDDED_LANGUAGES, EmbeddedLanguage } from './embeddedLangs';
import { debug } from 'console';
import { virtualDocument, enabledEmbeddedLangs, EXTENSION_NAME, CONFIGURATION_SECTION } from './globals';


let client: LanguageClient;


function initialize() {
	const enabledEmbeddedLanguages: Array<string> = workspace.getConfiguration(CONFIGURATION_SECTION).get('enabledEmbeddedLanguages');
	const enabledExternalLanguages: Array<string> = workspace.getConfiguration(CONFIGURATION_SECTION).get('enabledExternalLanguages');
	// Todo: add user customize language setting
	// const extraLanguageSettings = workspace.getConfiguration(CONFIGURATION_SECTION).get('extraLanguageSettings');
	console.log("Enabled Embedded Lang Configure:", enabledEmbeddedLanguages);
	console.log("Enabled External Lang Configure:", enabledExternalLanguages);

	let documentSelectors = enabledExternalLanguages.map(function (langs) {
		return { scheme: 'file', language: langs };
	});

	console.log(documentSelectors);
	for (var lang of EMBEDDED_LANGUAGES) {
		if (enabledEmbeddedLanguages.find(name => name === lang.name)) {
			enabledEmbeddedLangs.push(new EmbeddedLanguage(lang));
		}
		debug(enabledEmbeddedLangs)
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

	workspace.registerTextDocumentContentProvider(EXTENSION_NAME, {
		provideTextDocumentContent: uri => virtualDocument.getContent(uri)
	});

	let clientOptions: LanguageClientOptions = {
		documentSelector: ds,//[{ scheme: 'file', language: '*' }],
		middleware: {
			// didSave: 
			// handleDiagnostics:
			provideCompletionItem: async (document, position, context, token, next) => {
				const vdocUri = generateVirtualContentUri(document, position, true);
				return commands.executeCommand<CompletionList>(
					'vscode.executeCompletionItemProvider',
					vdocUri,
					position,
					context.triggerCharacter
				);
			},
			provideHover: async (document, position, token, next) => {
				const vdocUri = generateVirtualContentUri(document, position, false);
				// There are three Hovers - vscode.Hover, modes.Hover and types.Hover
				let results = await commands.executeCommand(
					'vscode.executeHoverProvider',
					vdocUri,
					position,
				)
				console.log("results", results[0]);
				if (results && results[0]) {
					let contents =[];
					results[0].contents.forEach(element => {
						contents.push(element.value);
					});
					console.log(contents);
					return new Hover(contents, results[0].range);
				}
				return ;
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
