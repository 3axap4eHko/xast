import { Tokenizer } from '../Lexer';
import { TokenKind } from '../TokenKind';
import { createToken } from '../createToken';
import { isDigit, isNameStart } from '../characterClasses';

export const readNumber: Tokenizer = (lexer, start, firstCode) => {
  const source = lexer.source;
  const body = source.body;
  let position = start;
  let code = firstCode;

  // NegativeSign (-)
  if (code === 0x002d) {
    code = body.charCodeAt(++position);
  }

  // Zero (0)
  if (code === 0x0030) {
    code = body.charCodeAt(++position);
    if (isDigit(code)) {
      throw source.syntaxError(
        position,
        `Invalid number, unexpected digit after 0: ${source.printCodePointAt(position)}.`,
      );
    }
  } else {
    position = source.readDigits(position, code);
    code = body.charCodeAt(position);
  }

  // Full stop (.)
  if (code === 0x002e) {
    code = body.charCodeAt(++position);
    position = source.readDigits(position, code);
    code = body.charCodeAt(position);
  }

  // E e
  if (code === 0x0045 || code === 0x0065) {

    code = body.charCodeAt(++position);
    // + -
    if (code === 0x002b || code === 0x002d) {
      code = body.charCodeAt(++position);
    }
    position = source.readDigits(position, code);
    code = body.charCodeAt(position);
  }

  if (code === 0x002e || isNameStart(code)) {
    throw source.syntaxError(
      position,
      `Invalid number, expected digit but got: ${source.printCodePointAt(position)}.`,
    );
  }

  return createToken(
    lexer,
    TokenKind.NUMBER,
    start,
    position,
    body.slice(start, position),
  );
}
