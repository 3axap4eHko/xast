import {
  Lexer,
  addDefaultTokenizers,
  Parser,
  parsers,
  TokenKind,
  NodeParser,
  Node,
} from '../index';

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

const schema = `enum Test { A, B, C };`

describe('Enum test suite', () => {
  it('should parse enum', () => {
    const lexer = new Lexer(schema);
    addDefaultTokenizers(lexer);

    const parser = new Parser(lexer, { enableLocation: true });
    parser.add(enumParser);

    const result = parser.parseSchema();
    expect(result).toMatchObject({
      kind: 'SCHEMA',
      definitions: [
        expect.objectContaining({
          kind: 'ENUM',
          name: expect.objectContaining({
            kind: 'NAME',
            value: 'Test',
          }),
          values: expect.arrayContaining([
            expect.objectContaining({
              kind: 'ENUM_VALUE',
              value: expect.objectContaining({
                kind: 'NAME',
                value: 'A',
              }),
            }),
            expect.objectContaining({
              kind: 'ENUM_VALUE',
              value: expect.objectContaining({
                kind: 'NAME',
                value: 'B',
              }),
            }),
            expect.objectContaining({
              kind: 'ENUM_VALUE',
              value: expect.objectContaining({
                kind: 'NAME',
                value: 'C',
              }),
            }),
          ])
        })
      ]
    });
  });
});
