import { Parser, NodeParser, Node } from '../Parser';

export interface NullValueNode extends Node {
  readonly kind: 'NULL';
}

export const nullValueParser: NodeParser<NullValueNode> = {
  kind: 'NULL',
  parse(parser: Parser): NullValueNode | undefined {
    const token = parser.lexer.token;
    if (token.value === 'null') {
      parser.advanceLexer();
      return parser.node<NullValueNode>(token, {
        kind: nullValueParser.kind,
      });
    }
  }
}
