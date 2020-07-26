import { DocumentStream } from "./multiLineStream";
import { EmbeddedLanguage } from "./embeddedLangs";
import { Position, TextDocument, Uri } from 'vscode';
import { enabledEmbeddedLangs, EXTENSION_NAME, virtualDocument } from './globals';
import { debug } from 'console';

function getLastLanguage(languages: EmbeddedLanguage[]): EmbeddedLanguage {
	if (languages && languages.length) {
		return languages[languages.length - 1];
	}
	return null;
}

export function recognizeEmbeddedLanguage(document: TextDocument, position: Position): EmbeddedLanguage {
	let stream = new DocumentStream(document);
	let languageQueue = Array<EmbeddedLanguage>();


	while (stream.line <= position.line) {
		for (var lang of enabledEmbeddedLangs) {
			if (getLastLanguage(languageQueue) === lang) {
				let range = stream.checkIfRegExp(lang.pattern.end);
				if (range !== undefined && range.end.isBeforeOrEqual(position)) {
					languageQueue.pop();
				}
			}
			let range = stream.checkIfRegExp(lang.pattern.begin);
			if (range !== undefined && range.start.isBeforeOrEqual(position)) {
				languageQueue.push(lang);
			}
		}
		stream.advance(1);
	}
	return getLastLanguage(languageQueue);
}

export function extractVirtualContent(document: TextDocument, language: EmbeddedLanguage) {
	let stream = new DocumentStream(document);
	let languageQueue = Array<EmbeddedLanguage>();
	let virtualContentArray = new Array<string>();

	while (!stream.eos()) {
		let lineText: string = stream.getLineText();
		let notModified: boolean = true;
		for (var lang of enabledEmbeddedLangs) {
			if (getLastLanguage(languageQueue) === lang) {
				let range = stream.checkIfRegExp(lang.pattern.end);
				if (range !== undefined) {
					languageQueue.pop();
					if (lang === language) {
						lineText = lineText.slice(0, range.end.character) + ' '.repeat(lineText.length - range.end.character);
						notModified = false;
					}
				}
			}
			let range = stream.checkIfRegExp(lang.pattern.begin);
			if (range !== undefined) {
				languageQueue.push(lang);
				if (lang === language) {
					lineText = ' '.repeat(range.start.character) + lineText.slice(range.start.character);
					notModified = false;
				}
			}

		}
		// console.log(languageQueue.length>0?getLastLanguage(languageQueue).name:null , lineText);
		if (getLastLanguage(languageQueue) !== language && notModified === true) {
			lineText = ' '.repeat(stream.getLineLength());
		}
		virtualContentArray.push(lineText);
		stream.advance(1);
	}
	return virtualContentArray.join('\n');
}

export function generateVirtualContentUri (document: TextDocument, position: Position, isContentModified: boolean = false) : Uri{
	const lang = recognizeEmbeddedLanguage(document, position);
	// If it is not in any embedded language code region, do not perform request forwarding
	if (lang === null) {
		return null;
	}

	const originalUri = document.uri.toString();
	const decodedUri = decodeURIComponent(originalUri);
	if (isContentModified === true || !virtualDocument.hasUri(decodedUri)) {
		const extractedCode = extractVirtualContent(document, lang);
		virtualDocument.setContent(decodedUri, extractedCode);
	}
	// debug(lang);
	const uriString = `${EXTENSION_NAME}://${lang.name}/${encodeURIComponent(originalUri)}.${lang.suffix}`;
	return Uri.parse(uriString);
}