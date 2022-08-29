import { read16BitHexCode, readHexDigit } from './utils';
import { isDigit, isUnicodeScalarValue, isLeadingSurrogate, isTrailingSurrogate } from './characterClasses';
import { TokenKind } from './TokenKind';

interface EscapeSequence {
  value: string;
  size: number;
}

interface LocationOffset {
  line: number;
  column: number;
}

export class Source {
  body: string;
  name: string;
  locationOffset: LocationOffset;

  static isSource(source: unknown): source is Source {
    return source instanceof Source;
  }

  constructor(
    body: string,
    name = 'Schema',
    locationOffset: LocationOffset = { line: 1, column: 1 },
  ) {
    this.body = body;
    this.name = name;
    this.locationOffset = locationOffset;
  }

  get [Symbol.toStringTag]() {
    return 'Source';
  }

  readDigits(start: number, firstCode: number): number {
    if (!isDigit(firstCode)) {
      throw this.syntaxError(
        start,
        `Invalid number, got: ${this.printCodePointAt(start)}.`,
      );
    }

    const body = this.body;
    let position = start + 1;

    while (isDigit(body.charCodeAt(position))) {
      ++position;
    }

    return position;
  }

  readEscapedCharacter(position: number): EscapeSequence {
    const body = this.body;
    const code = body.charCodeAt(position + 1);
    switch (code) {
      case 0x0022: // "
        return { value: '\u0022', size: 2 };
      case 0x005c: // \
        return { value: '\u005c', size: 2 };
      case 0x002f: // /
        return { value: '\u002f', size: 2 };
      case 0x0062: // b
        return { value: '\u0008', size: 2 };
      case 0x0066: // f
        return { value: '\u000c', size: 2 };
      case 0x006e: // n
        return { value: '\u000a', size: 2 };
      case 0x0072: // r
        return { value: '\u000d', size: 2 };
      case 0x0074: // t
        return { value: '\u0009', size: 2 };
    }
    throw this.syntaxError(
      position,
      `Invalid character escape sequence: "${body.slice(
        position,
        position + 2,
      )}".`,
    );
  }

  readEscapedUnicodeFixedWidth(position: number): EscapeSequence {
    const body = this.body;
    const code = read16BitHexCode(body, position + 2);

    if (isUnicodeScalarValue(code)) {
      return { value: String.fromCodePoint(code), size: 6 };
    }

    if (isLeadingSurrogate(code)) {
      if (
        body.charCodeAt(position + 6) === 0x005c &&
        body.charCodeAt(position + 7) === 0x0075
      ) {
        const trailingCode = read16BitHexCode(body, position + 8);
        if (isTrailingSurrogate(trailingCode)) {
          return { value: String.fromCodePoint(code, trailingCode), size: 12 };
        }
      }
    }

    throw this.syntaxError(
      position,
      `Invalid Unicode escape sequence: "${body.slice(position, position + 6)}".`,
    );
  }

  readEscapedUnicodeVariableWidth(position: number): EscapeSequence {
    const body = this.body;
    let point = 0;
    let size = 3;
    while (size < 12) {
      const code = body.charCodeAt(position + size++);
      if (code === 0x007d) {
        if (size < 5 || !isUnicodeScalarValue(point)) {
          break;
        }
        return { value: String.fromCodePoint(point), size };
      }
      point = (point << 4) | readHexDigit(code);
      if (point < 0) {
        break;
      }
    }

    throw this.syntaxError(
      position,
      `Invalid Unicode escape sequence: "${body.slice(
        position,
        position + size,
      )}".`,
    );
  }

  printCodePointAt(position: number): string {
    const code = this.body.codePointAt(position);
    if (code === undefined) {
      return TokenKind.EOF;
    } else if (code >= 0x0020 && code <= 0x007e) {
      const char = String.fromCodePoint(code);
      return char === '"' ? "'\"'" : `"${char}"`;
    }

    return 'U+' + code.toString(16).toUpperCase().padStart(4, '0');
  }

  syntaxError(
    position: number,
    description: string,
  ): Error {
    return new Error(`Syntax Error: ${description}\n${position}\n${this.body.slice(position - 10, position + 10)}`);
  }
}
