import { Tokenizer } from '../Lexer';
import { TokenKind } from '../TokenKind';
import { createToken } from '../createToken';
import { isUnicodeScalarValue, isSupplementaryCodePoint } from '../characterClasses';

export const readComment: Tokenizer = (lexer, start) => {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start + 1;

  while (position < bodyLength) {
    const code = body.charCodeAt(position);

    if (code === 0x000a || code === 0x000d) {
      break;
    }

    if (isUnicodeScalarValue(code)) {
      ++position;
    } else if (isSupplementaryCodePoint(body, position)) {
      position += 2;
    } else {
      break;
    }
  }

  return createToken(
    lexer,
    TokenKind.COMMENT,
    start,
    position,
    body.slice(start + 1, position),
  );
}
