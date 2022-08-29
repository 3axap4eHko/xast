import { Lexer } from './Lexer';
import { Token } from './Token';
import { TokenKind } from './TokenKind';

export const createToken = (
  lexer: Lexer,
  kind: TokenKind,
  start: number,
  end: number,
  value?: string,
): Token => {
  const line = lexer.line;
  const col = 1 + start - lexer.lineStart;
  return new Token(kind, start, end, line, col, value);
}
