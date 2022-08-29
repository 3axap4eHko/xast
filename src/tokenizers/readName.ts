import { Tokenizer } from '../Lexer';
import { TokenKind } from '../TokenKind';
import { createToken } from '../createToken';
import { isNameContinue } from '../characterClasses';

export const readName: Tokenizer = (lexer, start) => {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start + 1;

  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    if (isNameContinue(code)) {
      ++position;
    } else {
      break;
    }
  }

  return createToken(
    lexer,
    TokenKind.NAME,
    start,
    position,
    body.slice(start, position),
  );
}
