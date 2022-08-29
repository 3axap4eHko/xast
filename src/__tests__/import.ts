import { Lexer } from '../Lexer';
import { addDefaultTokenizers } from '../addDefaultTokenizers';
import { TokenKind } from '../TokenKind';
import { Parser, NodeParser, Node } from '../Parser';
import { stringValueParser, StringValueNode } from '../parsers/string';
import { descriptionParser, DescriptionNode } from '../parsers/description';

interface ImportNode extends Node {
  readonly kind: 'IMPORT';
  readonly value: StringValueNode;
  readonly description?: DescriptionNode;
}

const KEYWORD = 'import';

const importParser: NodeParser<ImportNode> = {
  kind: 'IMPORT',
  trigger: {
    kind: TokenKind.NAME,
    keyword: KEYWORD,
  },
  parse(parser: Parser): ImportNode | undefined {
    const start = parser.lexer.token;
    const description = parser.optionalParse(descriptionParser);
    parser.expectKeyword(KEYWORD);
    const value = parser.expectParse(stringValueParser);
    parser.expectOptionalToken(TokenKind.SEMICOLON);

    return parser.node<ImportNode>(start, {
      kind: 'IMPORT',
      value,
      description,
    });
  }
}

const schema = `
import "test.schema";
`

describe('Import test suite', () => {
  it('should parse import', () => {
    const lexer = new Lexer(schema);
    const parser = new Parser(lexer);
    parser.add(importParser);
    addDefaultTokenizers(parser.lexer);
    const result = parser.parseSchema();

    expect(result).toMatchObject({
      kind: 'SCHEMA',
      definitions: [
        expect.objectContaining({
          kind: 'IMPORT',
          value: expect.objectContaining({
            kind: 'STRING',
            value: 'test.schema',
          })
        })
      ]
    });
  });
});
