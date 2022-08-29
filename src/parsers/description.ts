import { TokenKind } from '../TokenKind';
import { Parser, NodeParser, Node } from '../Parser';
import { stringValueParser } from './string';

export interface DescriptionNode extends Node {
  kind: 'DESCRIPTION';
  value: string;
}

export const descriptionParser: NodeParser<DescriptionNode> = {
  kind: 'DESCRIPTION',
  parse(parser: Parser): DescriptionNode | undefined {
    if (parser.peek(TokenKind.STRING)) {
      const token = parser.lexer.token;
      const { value } = parser.expectParse(stringValueParser);
      return parser.node<DescriptionNode>(token, {
        kind: descriptionParser.kind,
        value,
      })
    }
  },
}
