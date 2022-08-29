import { Parser, NodeParser, Node } from '../Parser';

export interface NumberValueNode extends Node {
  readonly kind: 'NUMBER';
  readonly value: string;
}

export const numberValueParser: NodeParser<NumberValueNode> = {
  kind: 'NUMBER',
  parse(parser: Parser): NumberValueNode {
    const token = parser.lexer.token;
    parser.advanceLexer();
    return parser.node<NumberValueNode>(token, {
      kind: numberValueParser.kind,
      value: token.value,
    });
  }
}
