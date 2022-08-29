import { TokenKind } from '../TokenKind';
import { Parser, NodeParser, Node } from '../Parser';
import { definitionParser } from './definition';

export interface SchemaNode extends Node {
  readonly kind: 'SCHEMA';
  readonly definitions: ReadonlyArray<Node>;
}

export const schemaParser: NodeParser<SchemaNode> = {
  kind: 'SCHEMA',
  parse(parser: Parser): SchemaNode {
    return parser.node<SchemaNode>(parser.lexer.token, {
      kind: schemaParser.kind,
      definitions: parser.many(
        TokenKind.SOF,
        definitionParser,
        TokenKind.EOF,
      ),
    });
  }
}
