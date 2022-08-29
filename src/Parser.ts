import { Location } from './Location';
import { Token } from './Token';
import { Lexer } from './Lexer';
import { TokenKind, getTokenKindDescription } from './TokenKind';
import { SchemaNode, schemaParser } from './parsers/schema';

export interface Node {
  readonly kind: string;
  readonly loc?: Location;
}

export interface ParseOptions {
  enableLocation?: boolean | undefined;
  maxTokens?: number | undefined;
}

export interface Trigger {
  readonly kind: TokenKind;
  readonly keyword?: string;
}

export interface NodeParser<N extends Node> {
  readonly kind: N['kind'];
  readonly trigger?: Trigger;
  parse(parser: Parser): N | undefined;
  [key: string]: unknown;
}

type NodeParserResult<P extends NodeParser<Node>> = ReturnType<P["parse"]>;
type MustNodeParserResult<P extends NodeParser<Node>> = NonNullable<NodeParserResult<P>>;

const ANY_KEYWORD = Symbol('@@any');

export class Parser {
  lexer: Lexer;
  protected _options: ParseOptions;
  protected _tokenCounter: number;
  protected _parsersMap: Map<TokenKind, Map<string | symbol, NodeParser<any>[]>>;

  constructor(lexer: Lexer, options: ParseOptions = {}) {
    this.lexer = lexer;
    this._options = options;
    this._tokenCounter = 0;
    this._parsersMap = new Map;
  }

  parseSchema(): SchemaNode {
    return this.expectParse(schemaParser);
  }

  add<N extends Node>(nodeParser: NodeParser<N>): void {
    if (nodeParser.trigger) {
      if (!this._parsersMap.has(nodeParser.trigger.kind)) {
        this._parsersMap.set(nodeParser.trigger.kind, new Map);
      }
      const parsersKindMap = this._parsersMap.get(nodeParser.trigger.kind);
      const keyword = nodeParser.trigger.keyword ?? ANY_KEYWORD;
      if (!parsersKindMap?.has(keyword)) {
        parsersKindMap?.set(keyword, []);
      }
      parsersKindMap?.get(keyword)?.push(nodeParser);
    }
  }

  parseToken(token: Token): Node | undefined {
    if (this._parsersMap.has(token.kind)) {
      const parsersKindMap = this._parsersMap.get(token.kind);
      for (const keyword of [token.value, ANY_KEYWORD]) {
        const nodeParsers = parsersKindMap?.get(keyword) || [];
        for (const nodeParser of nodeParsers) {
          const node = nodeParser.parse(this);
          if (node) {
            return node;
          }
        }
      }
    }
  }

  optionalParse<P extends NodeParser<any>>(nodeParser: P): NodeParserResult<P> {
    return nodeParser.parse(this);
  }


  expectParse<P extends NodeParser<any>>(nodeParser: P): MustNodeParserResult<P> {
    const node = nodeParser.parse(this);
    if (node) {
      return node;
    }

    throw this.lexer.source.syntaxError(
      this.lexer.token.start,
      `Expected ${nodeParser.kind}, found ${this.lexer.token.getDescription()}.`,
    );
  }

  node<T extends { loc?: Location | undefined }>(
    startToken: Token,
    node: T,
  ): T {
    if (this._options.enableLocation) {
      node.loc = new Location(
        startToken,
        this.lexer.lastToken,
        this.lexer.source,
      );
    }
    return node;
  }

  peek(kind: TokenKind): boolean {
    return this.lexer.token.kind === kind;
  }

  expectToken(kind: TokenKind): Token {
    const token = this.lexer.token;
    if (token.kind === kind) {
      this.advanceLexer();
      return token;
    }

    throw this.lexer.source.syntaxError(
      token.start,
      `Expected ${getTokenKindDescription(kind)}, found ${token.getDescription()}.`,
    );
  }

  expectOptionalToken(kind: TokenKind): boolean {
    const token = this.lexer.token;
    if (token.kind === kind) {
      this.advanceLexer();
      return true;
    }
    return false;
  }

  expectKeyword(value: string): void {
    const token = this.lexer.token;
    if (token.kind === TokenKind.NAME && token.value === value) {
      this.advanceLexer();
    } else {
      throw this.lexer.source.syntaxError(
        token.start,
        `Expected "${value}", found ${token.getDescription()}.`,
      );
    }
  }

  expectOptionalKeyword(value: string): boolean {
    const token = this.lexer.token;
    if (token.kind === TokenKind.NAME && token.value === value) {
      this.advanceLexer();
      return true;
    }
    return false;
  }

  unexpected(atToken?: Token | null | undefined): Error {
    const token = atToken ?? this.lexer.token;
    return this.lexer.source.syntaxError(
      token.start,
      `Unexpected ${token.getDescription()}.`,
    );
  }

  any<P extends NodeParser<any>>(
    openKind: TokenKind,
    nodeParser: P,
    closeKind: TokenKind,
  ): MustNodeParserResult<P>[] {
    this.expectToken(openKind);
    const nodes: MustNodeParserResult<P>[] = [];
    while (!this.expectOptionalToken(closeKind)) {
      nodes.push(this.expectParse(nodeParser));
    }
    return nodes;
  }

  many<P extends NodeParser<N>, N extends Node>(
    openKind: TokenKind,
    nodeParser: P,
    closeKind: TokenKind,
  ): MustNodeParserResult<P>[] {
    this.expectToken(openKind);
    const nodes: MustNodeParserResult<P>[] = [];
    do {
      nodes.push(this.expectParse(nodeParser));
    } while (!this.expectOptionalToken(closeKind));
    return nodes;
  }

  optionalMany<P extends NodeParser<N>, N extends Node>(
    openKind: TokenKind,
    nodeParser: P,
    closeKind: TokenKind,
  ): MustNodeParserResult<P>[] {
    if (this.expectOptionalToken(openKind)) {
      const nodes: MustNodeParserResult<P>[] = [];
      do {
        nodes.push(this.expectParse(nodeParser));
      } while (!this.expectOptionalToken(closeKind));
      return nodes;
    }
    return [];
  }

  delimitedMany<P extends NodeParser<N>, N extends Node>(
    delimiterKind: TokenKind,
    nodeParser: P,
  ): MustNodeParserResult<P>[] {
    this.expectOptionalToken(delimiterKind);
    const nodes: MustNodeParserResult<P>[] = [];
    do {
      nodes.push(this.expectParse(nodeParser));
    } while (this.expectOptionalToken(delimiterKind));
    return nodes;
  }

  advanceLexer(): void {
    const { maxTokens } = this._options;
    const token = this.lexer.advance();

    if (maxTokens !== undefined && token.kind !== TokenKind.EOF) {
      ++this._tokenCounter;
      if (this._tokenCounter > maxTokens) {
        throw this.lexer.source.syntaxError(
          token.start,
          `Schema contains more than ${maxTokens} tokens.`,
        );
      }
    }
  }
}
