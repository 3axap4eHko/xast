# XAST

0-deps configurable Abstract Syntax Tree parser

[![Build Status][github-image]][github-url]
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![Coverage Status][codecov-image]][codecov-url]
[![Maintainability][codeclimate-image]][codeclimate-url]
[![Snyk][snyk-image]][snyk-url]

## Table of Contents

  - [Features](#features)
  - [Browser Support](#browser-support)
  - [Installing](#installing)
  - [Examples](#examples)
  - [License](#license)

## Features

- Configurable Lexer with predefined tokenizers
- Flexible Parser with modulized AST node parsers
- TypeScript support
- Supports NodeJS and Browser

## Support

![NodeJS][nodejs-image] | ![Chrome][chrome-image] | ![Firefox][firefox-image] | ![Safari][safari-image] | ![Opera][opera-image] | ![Edge][edge-image] |
--- | --- | --- | --- | --- | --- |
LTS ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ |

[nodejs-image]: https://raw.github.com/alrra/browser-logos/main/src/node.js/node.js_48x48.png
[chrome-image]: https://raw.github.com/alrra/browser-logos/main/src/chrome/chrome_48x48.png
[firefox-image]: https://raw.github.com/alrra/browser-logos/main/src/firefox/firefox_48x48.png
[safari-image]: https://raw.github.com/alrra/browser-logos/main/src/safari/safari_48x48.png
[opera-image]: https://raw.github.com/alrra/browser-logos/main/src/opera/opera_48x48.png
[edge-image]: https://raw.github.com/alrra/browser-logos/main/src/edge/edge_48x48.png

## Installing

Using yarn:

```bash
$ yarn add xast
```

Using npm:

```bash
$ npm install xast
```

## Example

Create an enum parser in file `enum.ts`
```typescript
import {
  Parser,
  parsers,
  TokenKind,
  NodeParser,
  Node,
} from 'xast';

export interface EnumValueNode extends Node {
  readonly kind: 'ENUM_VALUE';
  readonly value: parsers.NameNode;
}

export const enumValueParser: NodeParser<EnumValueNode> = {
  kind: 'ENUM_VALUE',
  parse(parser: Parser): EnumValueNode | undefined {
    const start = parser.lexer.token;
    const value = parser.expectParse(parsers.nameParser);

    return parser.node<EnumValueNode>(start, {
      kind: 'ENUM_VALUE',
      value,
    });
  }
}

const KEYWORD = 'enum';

export interface EnumNode extends Node {
  readonly kind: 'ENUM';
  readonly name: parsers.NameNode;
  readonly values: EnumValueNode[];
}

export const enumParser: NodeParser<EnumNode> = {
  kind: 'ENUM',
  trigger: {
    kind: TokenKind.NAME,
    keyword: KEYWORD,
  },
  parse(parser: Parser): EnumNode | undefined {
    const start = parser.lexer.token;
    parser.expectKeyword(KEYWORD);
    const name = parser.expectParse(parsers.nameParser);
    parser.expectToken(TokenKind.BRACE_L);
    const values = parser.delimitedMany(TokenKind.COMMA, enumValueParser);
    parser.expectToken(TokenKind.BRACE_R);
    parser.expectToken(TokenKind.SEMICOLON);

    return parser.node<EnumNode>(start, {
      kind: 'ENUM',
      name,
      values,
    });
  }
}
```

Parser usage example
```typescript
import {
  Lexer,
  addDefaultTokenizers,
  Parser,
  parsers
} from 'xast';

import { enumParser } from './enum.ts';

const schema = `enum Test { A, B, C };`;
const lexer = new Lexer(schema);
addDefaultTokenizers(lexer);

const parser = new Parser(lexer);
parser.add(enumParser);
console.log(parser.parseSchema());
```

Results to the following AST
```json
{
  "kind": "SCHEMA",
  "definitions": [
    {
      "kind": "ENUM",
      "name": {
        "kind": "NAME",
        "value": "Test"
      },
      "values": [
        {
          "kind": "ENUM_VALUE",
          "value": {
            "kind": "NAME",
            "value": "A"
          }
        },
        {
          "kind": "ENUM_VALUE",
          "value": {
            "kind": "NAME",
            "value": "B"
          }
        },
        {
          "kind": "ENUM_VALUE",
          "value": {
            "kind": "NAME",
            "value": "C"
          }
        }
      ]
    }
  ]
}
```


## License

License [Apache-2.0](http://www.apache.org/licenses/LICENSE-2.0)
Copyright (c) 2023-present Ivan Zakharchanka

[npm-url]: https://www.npmjs.com/package/xast
[downloads-image]: https://img.shields.io/npm/dw/xast.svg?cacheSeconds=300
[npm-image]: https://img.shields.io/npm/v/xast.svg?cacheSeconds=300
[github-url]: https://github.com/3axap4eHko/xast/actions/workflows/cicd.yml
[github-image]: https://github.com/3axap4eHko/xast/actions/workflows/cicd.yml/badge.svg
[codecov-url]: https://codecov.io/gh/3axap4eHko/xast
[codecov-image]: https://codecov.io/gh/3axap4eHko/xast/branch/master/graph/badge.svg?token=DPHqdADIWj
[codeclimate-url]: https://codeclimate.com/github/3axap4eHko/xast/maintainability
[codeclimate-image]: https://api.codeclimate.com/v1/badges/2d7b95f08c26581147c3/maintainability
[snyk-url]: https://snyk.io/test/npm/xast/latest
[snyk-image]: https://img.shields.io/snyk/vulnerabilities/github/3axap4eHko/xast.svg?maxAge=43200
