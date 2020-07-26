# Power Embedded Langs

A VSCode Extension to support some specific language features for languages which are embedded into other languages.

Currently, it supports the basic autocompletion and hover prompt for sql, javascript, css and html. These languages are recoginzed by specific sign pairs using RegEx. The result of autocompletion and hover prompt are related to recoginezd embedded language itself.

<!-- ## Documents

English | [中文文档]() -->

## Concepts

Here are some concepts used in this extension:

| Concept           | Description                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| External Language | The original language of a file.                                                                                                    |
| Embedded Language | A language which is embedded into the external languages.                                                                           |
| Sign Pair         | A pair of text which is used to mark and recognize embedded languages. Always the signs will be comments of such embedded language. |

## Features & Support Languages

- [x] autocomplete - base support
- [x] hover - base support
- [x] highlight - which has been supported in another extension [highlight-string-code](https://marketplace.visualstudio.com/items?itemName=iuyoy.highlight-string-code). However, the matching logic of nested sign pairs are different from this extension now.
- [ ] more features will be support.

### Sign Pairs (so far)

| Language | Start Sign                   | End Sign                 | Comment |
| -------- | ---------------------------- | ------------------------ | ------- |
| SQL      | `-- *(beginsql|begin-sql).*` | `-- *(endsql|end-sql).*` |
| HTML     | `<!-- *html.*-->`            | `<!-- *!html.*-->`       |
| JS       | `\/\/ *js.*`                 | `\/\/ *!js.*`            |
| CSS      | `\/\* *css.*\*\/`            | `\/\* *!css.*\*\/`       |

## Requirements

- Latest Visual Studio Code is recommended.

## Extension Settings

This extension contributes the following settings:

- `PEL.enabledEmbeddedLanguages`: Specifies what embedded languages will be recognized.
- `PEL.enabledExternalLanguages`: Specifies files of what external languages the extension will monitor.

## Release Notes

### Unreleased

- Implement basic support for auto completion and hovering
- Initial release

More release notes can be found at [CHANGELOG.md](./CHANGELOG.md).

## Known Issues

See [known issue](https://github.com/iuyoy/Power-Embedded-Langs/labels/known%20issue) for more infomation.

## Design and Implement

This extension is based on the *Request Forwarding* method in VSCode official doc of embedded languages.

Work Flow:

- Client
  1. The extension will scan the whole code text when typing any character.
  2. Recognize the language at the position of cursor.
  3. If language is an embedded language, all corresponding code will be extracted from the file.
  4. Call correspond functions to supported feature.

## TODO

- [x] general embedded langs recognition
- [ ] refresh status when configuration are changed
- [ ] ~~dynamic importing third-part language server modules (not need anymore)~~
- [x] common virtual document extraction
- [ ] customize embedded language settings, including sign pairs, name and suffix.
- [ ] popup a notfication when extension updated.
- [ ] Chinese document.

## Tests

- [ ] language recognition test
- [ ] language extraction test

## References

- Visual Studio Code Extension API
  - [Language Server for Embedded Programming Languages](https://code.visualstudio.com/api/language-extensions/embedded-languages)
