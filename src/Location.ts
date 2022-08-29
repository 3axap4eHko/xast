import type { Source } from './Source';
import type { Token } from './Token';

export class Location {
  readonly start: number;
  readonly end: number;
  readonly startToken: Token;
  readonly endToken: Token;
  readonly source: Source;

  constructor(startToken: Token, endToken: Token, source: Source) {
    this.start = startToken.start;
    this.end = endToken.end;
    this.startToken = startToken;
    this.endToken = endToken;
    this.source = source;
  }

  get [Symbol.toStringTag]() {
    return 'Location';
  }

  toJSON(): { start: number; end: number } {
    return { start: this.start, end: this.end };
  }
}
