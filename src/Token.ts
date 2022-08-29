import { TokenKind, getTokenKindDescription } from './TokenKind';

export class Token {
  readonly kind: TokenKind;
  readonly start: number;
  readonly end: number;
  readonly line: number;
  readonly column: number;
  readonly value: string;
  readonly prev: Token | null;
  readonly next: Token | null;

  constructor(
    kind: TokenKind,
    start: number,
    end: number,
    line: number,
    column: number,
    value?: string,
  ) {
    this.kind = kind;
    this.start = start;
    this.end = end;
    this.line = line;
    this.column = column;
    this.value = value!;
    this.prev = null;
    this.next = null;
  }

  get [Symbol.toStringTag]() {
    return 'Token';
  }

  toJSON(): {
    kind: TokenKind;
    value?: string;
    line: number;
    column: number;
  } {
    return {
      kind: this.kind,
      value: this.value,
      line: this.line,
      column: this.column,
    };
  }
  getDescription(): string {
    return getTokenKindDescription(this.kind) + (this.value != null ? ` "${this.value}"` : '');
  }
}
