export class MapList<K, V> {
  private _map = new Map<K, V[]>;

  clear(): void {
    this._map.clear();
  }
  delete(key: K): boolean {
    return this._map.delete(key);
  }
  forEachKey(key: K, callbackfn: (value: V, index: number) => void): void {
    this._map.get(key)?.forEach((value, index) => callbackfn(value, index));
  }
  forEach(callbackfn: (value: V, key: K, index: number) => void): void {
    this._map.forEach((values, key) => {
      values.forEach((value, index) => callbackfn(value, key, index));
    });
  }
  get(key: K): V[] | undefined {
    return this._map.get(key);
  }
  has(key: K): boolean {
    return this._map.has(key);
  }
  set(key: K, value: V): this {
    if (!this._map.has(key)) {
      this._map.set(key, [value]);
    } else {
      this._map.get(key)?.push(value);
    }
    return this;
  }
  get size(): number {
    return this._map.size;
  }
}

export const read16BitHexCode = (source: string, position: number): number => {
  return (
    (readHexDigit(source.charCodeAt(position)) << 12) |
    (readHexDigit(source.charCodeAt(position + 1)) << 8) |
    (readHexDigit(source.charCodeAt(position + 2)) << 4) |
    readHexDigit(source.charCodeAt(position + 3))
  );
}


export const readHexDigit = (code: number): number => {
  return code >= 0x0030 && code <= 0x0039 // 0-9
    ? code - 0x0030
    : code >= 0x0041 && code <= 0x0046 // A-F
      ? code - 0x0037
      : code >= 0x0061 && code <= 0x0066 // a-f
        ? code - 0x0057
        : -1;
}
