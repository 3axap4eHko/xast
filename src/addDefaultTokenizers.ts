import { Lexer, Tokenizer } from './Lexer';
import { TokenKind } from './TokenKind';
import { createToken } from './createToken';
import { readName } from './tokenizers/readName';
import { readString } from './tokenizers/readString';
import { readNumber } from './tokenizers/readNumber';
import { readComment } from './tokenizers/readComment';

const createTokenizer = (tokenKind: TokenKind): Tokenizer => {
  return (lexer, position) =>  createToken(lexer, tokenKind, position, position + 1);
};

export const addDefaultTokenizers = (lexer: Lexer) => {

  lexer.add(0x0023, (lexer, position, code) => readComment(lexer, position, code));
  lexer.add(0x002f, (lexer, position, code) => {
    if (lexer.source.body[position + 1].charCodeAt(0) === 0x002f) {
      return readComment(lexer, position + 1, code);
    }
  });

  lexer.add(0x0022, readString);
  lexer.add(0x0027, readString);
  lexer.add(0x0060, readString);

  lexer.add(0x002d, readNumber);
  for(let code = 0x0030; code <=0x0039; code++) {
    lexer.add(code, readNumber);
  }

  lexer.add(0x005f, readName);
  for(let code = 0x0061; code <=0x007a; code++) { // A-Z
    lexer.add(code, readName);
  }
  for(let code = 0x0041; code <=0x005a; code++) { // a-z
    lexer.add(code, readName);
  }

  lexer.add(0x0021, createTokenizer(TokenKind.BANG)); // !
  lexer.add(0x0024, createTokenizer(TokenKind.DOLLAR)); // $
  lexer.add(0x0026, createTokenizer(TokenKind.AMP)); // &
  lexer.add(0x0028, createTokenizer(TokenKind.PAREN_L)); // (
  lexer.add(0x0029, createTokenizer(TokenKind.PAREN_R)); // )
  lexer.add(0x002c, createTokenizer(TokenKind.COMMA)); // ,
  lexer.add(0x002e, (lexer, position) => { // .
    const body = lexer.source.body;
    if (
      body.charCodeAt(position + 1) === 0x002e &&
      body.charCodeAt(position + 2) === 0x002e
    ) {
      return createToken(lexer, TokenKind.SPREAD, position, position + 3);
    }
    return createToken(lexer, TokenKind.DOT, position, position + 1);
  });
  lexer.add(0x003a, createTokenizer(TokenKind.COLON)); // :
  lexer.add(0x003b, createTokenizer(TokenKind.SEMICOLON)); // ;
  lexer.add(0x003d, createTokenizer(TokenKind.EQUALS)); // =
  lexer.add(0x0040, createTokenizer(TokenKind.AT)); // @
  lexer.add(0x005b, createTokenizer(TokenKind.BRACKET_L)); // [
  lexer.add(0x005d, createTokenizer(TokenKind.BRACKET_R)); // ]
  lexer.add(0x007b, createTokenizer(TokenKind.BRACE_L)); // {
  lexer.add(0x007c, createTokenizer(TokenKind.PIPE)); // |
  lexer.add(0x007d, createTokenizer(TokenKind.BRACE_R)); // }
  lexer.add(0x003f, createTokenizer(TokenKind.QUESTION_MARK)); // ?
};
