import {
  Lexer,
  addDefaultTokenizers,
  Parser,
  parsers,
  TokenKind,
  NodeParser,
  Node,
} from '../index';

const KEYWORD = 'variable';

type ValueNode = parsers.BooleanValueNode | parsers.NullValueNode | parsers.StringValueNode | parsers.NumberValueNode;

export interface VariableNode extends Node {
  readonly kind: 'VARIABLE';
  readonly name: parsers.NameNode;
  readonly value: ValueNode;
}
const getValue = (parser: Parser): ValueNode => {
  const token = parser.lexer.token;
  parser.advanceLexer();
  switch (token.kind) {
    case TokenKind.NUMBER:
      return parser.node<parsers.NumberValueNode>(token, {
        kind: 'NUMBER',
        value: token.value,
      });
    case TokenKind.STRING:
    case TokenKind.STRING_EXPR:
      return parser.node<parsers.StringValueNode>(token, {
        kind: 'STRING',
        value: token.value,
      });
    case TokenKind.NAME:
      switch (token.value) {
        case 'true':
          return parser.node<parsers.BooleanValueNode>(token, {
            kind: 'BOOLEAN',
            value: true,
          });
        case 'false':
          return parser.node<parsers.BooleanValueNode>(token, {
            kind: 'BOOLEAN',
            value: false,
          });
        case 'null':
          return parser.node<parsers.NullValueNode>(token, { kind: 'NULL' });
        default:
          throw parser.unexpected(token);
      }
  }
  throw parser.unexpected(token);
}

export const variableParser: NodeParser<VariableNode> = {
  kind: 'VARIABLE',
  trigger: {
    kind: TokenKind.NAME,
    keyword: KEYWORD,
  },
  parse(parser: Parser): VariableNode | undefined {
    const token = parser.lexer.token;
    parser.expectKeyword(KEYWORD);
    const name = parser.expectParse(parsers.nameParser);
    parser.expectToken(TokenKind.EQUALS);
    const value = getValue(parser);
    parser.expectToken(TokenKind.SEMICOLON);

    return parser.node<VariableNode>(token, {
      kind: 'VARIABLE',
      name,
      value,
    });
  },

}

const expectVariable = (name: string, type: string, value?: string | boolean) => {
  return expect.objectContaining({
    kind: 'VARIABLE',
    name: expect.objectContaining({
      kind: 'NAME',
      value: name,
    }),
    value: expect.objectContaining({
      kind: type,
      ...(typeof value === 'undefined' ? {} : { value }),
    }),
  });
}

describe('Variable test suite', () => {
  it.each([
    { schema: 'variable BOOLEAN_TRUE = true;', name: 'BOOLEAN_TRUE', type: 'BOOLEAN', value: true },
    { schema: 'variable BOOLEAN_FALSE = false;', name: 'BOOLEAN_FALSE', type: 'BOOLEAN', value: false },
    { schema: 'variable NULL = null;', name: 'NULL', type: 'NULL' },
    { schema: 'variable STRING = "string";', name: 'STRING', type: 'STRING', value: 'string' },
    { schema: 'variable INT_NUMBER = 12;', name: 'INT_NUMBER', type: 'NUMBER', value: '12' },
    { schema: 'variable FLOAT_NUMBER = 12.3;', name: 'FLOAT_NUMBER', type: 'NUMBER', value: '12.3' },
  ])('Should parse variable $variable of type $type', ({ schema, name, type, value }) => {
    const lexer = new Lexer(schema);
    addDefaultTokenizers(lexer);

    const parser = new Parser(lexer, { enableLocation: true });
    parser.add(variableParser);

    const result = parser.parseSchema();
    expect(result).toMatchObject({
      kind: 'SCHEMA',
      definitions: [
        expectVariable(name, type, value)
      ]
    });
  });
});
