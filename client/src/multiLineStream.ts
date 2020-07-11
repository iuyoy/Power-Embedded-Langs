import { Position, TextDocument, Range } from 'vscode';

const _BNG = '!'.charCodeAt(0);
const _MIN = '-'.charCodeAt(0);
const _LAN = '<'.charCodeAt(0);
const _RAN = '>'.charCodeAt(0);
const _FSL = '/'.charCodeAt(0);
const _EQS = '='.charCodeAt(0);
const _DQO = '"'.charCodeAt(0);
const _SQO = '\''.charCodeAt(0);
const _NWL = '\n'.charCodeAt(0);
const _CAR = '\r'.charCodeAt(0);
const _LFD = '\f'.charCodeAt(0);
const _WSP = ' '.charCodeAt(0);
const _TAB = '\t'.charCodeAt(0);


export class DocumentStream {
	private document: TextDocument;
	private _line: number;
	private _character: number;

	public get line(): number {
		return this._line;
	}
	// public set line(value: number) {
	// 	this._line = value;
	// }
	public get character(): number {
		return this._character;
	}
	// public set character(value: number) {
	// 	this._character = value;
	// }
	// constructor();

	constructor(document: TextDocument, line: number = 0, character: number = 0) {
		this.document = document;
		this._line = line;
		this._character = character;
	};

	public eos(): boolean {
		return this._line >= this.document.lineCount || (
			this.line + 1 === this.document.lineCount &&
			this.character >= this.getLineLength()
		);
	}

	public isPositionValid(): boolean {
		let position = new Position(this._line, this._character);
		const validatePosition = this.document.validatePosition(position);
		return (position === validatePosition);
	}
	public advance(lineDelta: number = 0, characterDelta: number = 0) {
		this._line += lineDelta;
		this._character += characterDelta;
	}
	public advanceTo(line?: number, character?: number) {
		if (line) {
			this._line = line;
		}
		if (character) {
			this._character = character;
		}
	};
	public advanceToPosition(position: Position) {
		this._line = position.line;
		this._character = position.character;
	};
	public checkIfRegExp(regex: RegExp): Range | undefined {
		let position = new Position(this._line, this._character);
		return this.document.getWordRangeAtPosition(position, regex);
	}
	public getLineLength(line?:number){
		if(line === undefined){ line = this._line;}
		return this.document.lineAt(line).text.length;
	}
	public getLineText(line?:number){
		if(line){ return this.document.lineAt(line).text;}
		return this.document.lineAt(this._line).text;
	}
	
	// public advanceIfRegExp(regex: RegExp): number {
	// 	// Match a RegExp, if match jump to 
	// 	// const str = this.source.substr(this.position);
	// 	const str = this.source[this.position.line];
	// 	const matches = str.match(regex);
	// 	for (const match of matches) {
	// 		if (match.)
	// 	}
	// 	if (match) {
	// 		// let matchPos = this.position + match.index!;
	// 		// this.position = matchPos + match[0].length;
	// 		// return matchPos;
	// 	}
	// 	return -1;
	// }

}
export class MultiLineStream {

	private source: string;
	private len: number;
	private position: number;

	constructor(source: string, position: number) {
		this.source = source;
		this.len = source.length;
		this.position = position;
	}

	public eos(): boolean {
		return this.len <= this.position;
	}

	public getSource(): string {
		return this.source;
	}

	public pos(): number {
		return this.position;
	}

	public goBackTo(pos: number): void {
		this.position = pos;
	}

	public goBack(n: number): void {
		this.position -= n;
	}

	public advance(n: number): void {
		this.position += n;
	}

	public goToEnd(): void {
		this.position = this.source.length;
	}

	public nextChar(): number {
		return this.source.charCodeAt(this.position++) || 0;
	}

	public peekChar(n: number = 0): number {
		return this.source.charCodeAt(this.position + n) || 0;
	}

	public advanceIfChar(ch: number): boolean {
		if (ch === this.source.charCodeAt(this.position)) {
			this.position++;
			return true;
		}
		return false;
	}

	public advanceIfChars(ch: number[]): boolean {
		let i: number;
		if (this.position + ch.length > this.source.length) {
			return false;
		}
		for (i = 0; i < ch.length; i++) {
			if (this.source.charCodeAt(this.position + i) !== ch[i]) {
				return false;
			}
		}
		this.advance(i);
		return true;
	}

	public advanceIfRegExp(regex: RegExp): number {
		const str = this.source.substr(this.position);
		const match = str.match(regex);
		if (match) {
			let matchPos = this.position + match.index!;
			this.position = matchPos + match[0].length;
			return matchPos;
		}
		return -1;
	}

	public advanceUntilRegExp(regex: RegExp): string {
		const str = this.source.substr(this.position);
		const match = str.match(regex);
		if (match) {
			this.position = this.position + match.index!;
			return match[0];
		} else {
			this.goToEnd();
		}
		return '';
	}

	public advanceUntilChar(ch: number): boolean {
		while (this.position < this.source.length) {
			if (this.source.charCodeAt(this.position) === ch) {
				return true;
			}
			this.advance(1);
		}
		return false;
	}

	// public skipLine() {
	// 	this.advanceUntilChar(_NWL);
	// 	this.advance(1);
	// }

	public advanceUntilChars(ch: number[]): boolean {
		while (this.position + ch.length <= this.source.length) {
			let i = 0;
			for (; i < ch.length && this.source.charCodeAt(this.position + i) === ch[i]; i++) {
			}
			if (i === ch.length) {
				return true;
			}
			this.advance(1);
		}
		this.goToEnd();
		return false;
	}

	public skipWhitespace(): boolean {
		const n = this.advanceWhileChar(ch => {
			return ch === _WSP || ch === _TAB || ch === _NWL || ch === _LFD || ch === _CAR;
		});
		return n > 0;
	}

	public advanceWhileChar(condition: (ch: number) => boolean): number {
		const posNow = this.position;
		while (this.position < this.len && condition(this.source.charCodeAt(this.position))) {
			this.position++;
		}
		return this.position - posNow;
	}

}
