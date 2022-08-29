import { TokenKind } from '../TokenKind';
import { Parser, NodeParser, Node } from '../Parser';

export const definitionParser: NodeParser<Node> = {
  kind: 'DEFINITION',
  parse(parser: Parser): Node {
    const hasDescription = parser.peek(TokenKind.STRING);
    const keywordToken = hasDescription
      ? parser.lexer.lookahead()
      : parser.lexer.token;

    const node = parser.parseToken(keywordToken);
    if (node) {
      return node;
    }

    throw parser.unexpected(keywordToken);
  }
}
