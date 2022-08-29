import { Parser, NodeParser, Node } from '../Parser';

export interface StringValueNode extends Node {
  readonly kind: 'STRING';
  readonly value: string;
}

export const stringValueParser: NodeParser<StringValueNode> = {
  kind: 'STRING',
  parse(parser: Parser): StringValueNode {
    const token = parser.lexer.token;
    parser.advanceLexer();
    return parser.node<StringValueNode>(token, {
      kind: stringValueParser.kind,
      value: token.value,
    });
  }
}
