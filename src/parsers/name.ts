import { TokenKind } from '../TokenKind';
import { Parser, NodeParser, Node } from '../Parser';

export interface NameNode extends Node {
  readonly kind: 'NAME';
  readonly value: string;
}

export const nameParser: NodeParser<NameNode> = {
  kind: 'NAME',
  parse(parser: Parser): NameNode {
    const token = parser.expectToken(TokenKind.NAME);
    return parser.node<NameNode>(token, {
      kind: nameParser.kind,
      value: token.value,
    });
  }
}
