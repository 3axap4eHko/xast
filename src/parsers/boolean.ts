import { Parser, NodeParser, Node } from '../Parser';

export interface BooleanValueNode extends Node {
  readonly kind: 'BOOLEAN';
  readonly value: boolean;
}

export const booleanValueParser: NodeParser<BooleanValueNode> = {
  kind: 'BOOLEAN',
  parse(parser: Parser): BooleanValueNode | undefined {
    const token = parser.lexer.token;
    const isTrue = token.value === 'true';
    const isFalse = token.value === 'false';
    if (isTrue || isFalse) {
      parser.advanceLexer();
      return parser.node<BooleanValueNode>(token, {
        kind: booleanValueParser.kind,
        value: isTrue,
      });
    }
  }
}
