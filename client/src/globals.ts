import { VirtualDocument } from './virtualDocument';
import { EmbeddedLanguage } from './embeddedLangs';
import { LanguageClient } from 'vscode-languageclient';

export const EXTENSION_NAME = "power-embedded-langs";
export const CONFIGURATION_SECTION = "PEL";

export const virtualDocument = new VirtualDocument();
export let enabledEmbeddedLangs = Array<EmbeddedLanguage>();