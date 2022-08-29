import { Token } from '../Token';
import { TokenKind } from '../TokenKind';

const kind = TokenKind.SOF;
const start = 1;
const end = 2;
const line = 3;
const column = 4;
const value = 'test';

const token = new Token(
  kind,
  start,
  end,
  line,
  column,
  value,
);

describe('Token test suite', () => {
  it('Should return toStringTag', () => {
    expect(`${token}`).toEqual('[object Token]');
  });

  it('Should return toJSON', () => {
    expect(token.toJSON()).toEqual({
      kind,
      value,
      line,
      column,
    });
  });

  it('Should return getDescription', () => {
    expect(token.getDescription()).toEqual(`${kind} "${value}"`);
  });
});
