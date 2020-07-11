import { MultiLineStream, DocumentStream } from "./multiLineStream";
import { ScannerState, TokenType, enabledEmbeddedLangs, EmbeddedLanguage } from "./embeddedLangs";
import { off } from 'process';
import { Position, TextDocument } from 'vscode';

interface EmbeddedRegion {
	languageId: string | undefined;
	start: number;
	end: number;
	attributeValue?: boolean;
}

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