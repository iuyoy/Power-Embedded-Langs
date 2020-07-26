import { recognizeEmbeddedLanguage, extractVirtualContent } from '../../embeddedSupport';
import { enabledEmbeddedLangs } from '../../globals';
import { workspace, Position, window } from 'vscode';
import * as assert from 'assert';

const codeExample = `"
/* css */
Checkpoint - css
/* !css */
Checkpoint - undefined
-- beginsql
Checkpoint - sql
-- endsql

Checkpoint - undefined
<!-- html -->
Checkpoint - html
// js
Checkpoint - js
// !js
Checkpoint - html
/* css */
Checkpoint - css
/* !css */
<!-- html -->
Checkpoint - html
<!-- !html -->
Checkpoint - html
<!-- !html -->
Checkpoint - undefined

Checkpoint - undefined
<!-- html -->
Checkpoint - html
// js
Checkpoint - js
<!-- !html -->
Checkpoint - js
// !js
Checkpoint - html
<!-- !html -->
Checkpoint - undefined
"`;



suite('Extension Test Suite', async () => {
	test('Language recognition', async () => {
		console.log(enabledEmbeddedLangs);
		let document = await workspace.openTextDocument({
			language: "bash",
			content: codeExample
		});

		for (let line = 0; line < document.lineCount; line++) {
			let position = new Position(line, 0);
			let lang = recognizeEmbeddedLanguage(document, position);
			let text = document.lineAt(line).text;
			// console.log(`Line${line}: ${text} ${lang?.name}`);
			if (text.search("Checkpoint") !== -1) {
				let recognition = "undefined";
				if (lang) { recognition = lang.suffix; }
				// console.log(text, recognition);
				assert.equal(text.substr(-recognition.length), recognition);
			}
		};

	}), test('Language code extraction', async () => {
		console.log(enabledEmbeddedLangs);
		let document = await workspace.openTextDocument({
			language: "bash",
			content: codeExample
		});
		for (var lang of enabledEmbeddedLangs) {
			console.log(lang.name);
			const extractContent = extractVirtualContent(document, lang).split("\n");
			for (var text of extractContent) {
				// console.log(text);
				if (text.search("Checkpoint") !== -1) {
					let recognition = "undefined";
					if (lang) { recognition = lang.suffix; }
					console.log(text, recognition);
					assert.equal(text.substr(-recognition.length), recognition);
				}
			}
		}
	});
});


