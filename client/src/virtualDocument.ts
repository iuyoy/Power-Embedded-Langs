import { Uri } from 'vscode';

export class VirtualDocument {
	private contents: Map<string, string>;
	constructor() {
		this.contents = new Map<string, string>();
	}

	public setContent(uri: string, content: string): void {
		this.contents.set(uri, content);
	}
	public hasUri(uri: string): boolean {
		return this.contents.has(uri);
	}
	// public getContent(uri?:string){
	// 	this.contents.get(uri)
	// }

	public getContent(uri?: Uri) {
		const originalUri = uri.path.slice(1).slice(0, uri.path.lastIndexOf('.') - uri.path.length);
		const decodedUri = decodeURIComponent(originalUri);
		return this.contents.get(decodedUri);
	}
}