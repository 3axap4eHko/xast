export function isWhiteSpace(code: number): boolean {
  return code === 0x0009 || code === 0x0020;
}

export function isDigit(code: number): boolean {
  return code >= 0x0030 && code <= 0x0039;
}

export function isLetter(code: number): boolean {
  return (
    (code >= 0x0061 && code <= 0x007a) || // A-Z
    (code >= 0x0041 && code <= 0x005a) // a-z
  );
}

export function isNameStart(code: number): boolean {
  return isLetter(code) || code === 0x005f; // _
}

export function isNameContinue(code: number): boolean {
  return isLetter(code) || isDigit(code) || code === 0x005f; // _
}

export function isUnicodeScalarValue(code: number): boolean {
  return (
    (code >= 0x0000 && code <= 0xd7ff) || (code >= 0xe000 && code <= 0x10ffff)
  );
}

export function isSupplementaryCodePoint(body: string, location: number): boolean {
  return (
    isLeadingSurrogate(body.charCodeAt(location)) &&
    isTrailingSurrogate(body.charCodeAt(location + 1))
  );
}

export function isLeadingSurrogate(code: number): boolean {
  return code >= 0xd800 && code <= 0xdbff;
}

export function isTrailingSurrogate(code: number): boolean {
  return code >= 0xdc00 && code <= 0xdfff;
}
