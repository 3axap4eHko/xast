import { Tokenizer } from '../Lexer';
import { TokenKind } from '../TokenKind';
import { createToken } from '../createToken';
import { isUnicodeScalarValue, isSupplementaryCodePoint } from '../characterClasses';

export const readString: Tokenizer = (lexer, start, quoteCode) => {
    const source = lexer.source;
    const body = source.body;
    const bodyLength = body.length;
    let position = start + 1;
    let chunkStart = position;
    let value = '';

    while (position < bodyLength) {
      const code = body.charCodeAt(position);

      if (code === quoteCode) {
        value += body.slice(chunkStart, position);
        return createToken(
          lexer,
          quoteCode === 0x0060 ? TokenKind.STRING_EXPR : TokenKind.STRING,
          start,
          position + 1,
          value
        );
      }

      if (code === 0x005c) {
        value += body.slice(chunkStart, position);
        const escape =
          body.charCodeAt(position + 1) === 0x0075 // u
            ? body.charCodeAt(position + 2) === 0x007b // {
              ? source.readEscapedUnicodeVariableWidth(position)
              : source.readEscapedUnicodeFixedWidth(position)
            : source.readEscapedCharacter(position);
        value += escape.value;
        position += escape.size;
        chunkStart = position;
        continue;
      }

      if (code === 0x000a || code === 0x000d) {
        break;
      }

      // SourceCharacter
      if (isUnicodeScalarValue(code)) {
        ++position;
      } else if (isSupplementaryCodePoint(body, position)) {
        position += 2;
      } else {
        throw source.syntaxError(
          position,
          `Invalid character within String: ${source.printCodePointAt(position)}.`,
        );
      }
    }

    throw source.syntaxError(position, 'Unterminated string.');
  }
