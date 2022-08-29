import { Token } from './Token';
import { Source } from './Source';
import { TokenKind } from './TokenKind';
import { MapList } from './utils';
import { isUnicodeScalarValue, isSupplementaryCodePoint } from './characterClasses';
import { createToken } from './createToken';

export interface Tokenizer {
  (lexer: Lexer, position: number, code: number): Token | undefined;
}

export class Lexer {
  source: Source;
  lastToken: Token;
  token: Token;
  line: number;
  lineStart: number;
  private _tokenizers: MapList<number, Tokenizer>;

  constructor(source: Source | string) {
    const sourceObj = Source.isSource(source) ? source : new Source(source);
    const startOfFileToken = new Token(TokenKind.SOF, 0, 0, 0, 0);

    this.source = sourceObj;
    this.lastToken = startOfFileToken;
    this.token = startOfFileToken;
    this.line = 1;
    this.lineStart = 0;
    this._tokenizers = new MapList();
  }

  get [Symbol.toStringTag]() {
    return 'Lexer';
  }

  add(code: number, tokenizer: Tokenizer) {
    this._tokenizers.set(code, tokenizer);
  }

  tokenize(position: number, code: number) {
    const tokenizers = this._tokenizers.get(code) || [];
    for (const tokenizer of tokenizers) {
      const token = tokenizer(this, position, code);
      if (token) {
        return token;
      }
    }
  }

  advance(): Token {
    this.lastToken = this.token;
    const token = (this.token = this.lookahead());
    return token;
  }

  lookahead(): Token {
    let token = this.token;
    if (token.kind !== TokenKind.EOF) {
      do {
        if (token.next) {
          token = token.next;
        } else {
          const nextToken = this.readNextToken(token.end);
          // @ts-expect-error next is only mutable during parsing.
          token.next = nextToken;
          // @ts-expect-error prev is only mutable during parsing.
          nextToken.prev = token;
          token = nextToken;
        }
      } while (token.kind === TokenKind.COMMENT);
    }
    return token;
  }

  readNextToken(start: number): Token {
    const source = this.source;
    const body = source.body;
    const bodyLength = body.length;
    let position = start;

    while (position < bodyLength) {
      const code = body.charCodeAt(position);
      const nextCode = body.charCodeAt(position + 1);

      switch (code) {
        // Skip BOM, tab, whitespace
        case 0xfeff:
        case 0x0009:
        case 0x0020:
          ++position;
          continue;
        // Skip (CR)LF
        case 0x000a:
        case 0x000d:
          ++position;
          if (code === 0x000d && nextCode === 0x000a) {
            ++position;
          }
          ++this.line;
          this.lineStart = position;
          continue;
      }
      const token = this.tokenize(position, code);
      if (token) {
        return token;
      }

      throw source.syntaxError(position,
        code === 0x0027
          ? 'Unexpected single quote character (\'), did you mean to use a double quote (")?'
          : isUnicodeScalarValue(code) || isSupplementaryCodePoint(body, position)
            ? `Unexpected character: ${source.printCodePointAt(position)}.`
            : `Invalid character: ${source.printCodePointAt(position)}.`,
      );
    }

    return createToken(this, TokenKind.EOF, bodyLength, bodyLength);
  }
}
