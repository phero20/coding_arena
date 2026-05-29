import { TypeNode, parseType } from "./type-ast";

export interface Codec<T = any> {
  typeName: string; // e.g. "Interval", "Pair<int,int>"
  canHandle: (node: TypeNode) => boolean;
  /** Parse a canonical JSON value into driver-ready value */
  parse: (value: any) => T;
  /** Serialize driver value into canonical JSONish string */
  serialize: (value: T) => any;
}

export class CodecRegistry {
  private codecs: Codec[] = [];

  register(codec: Codec): void {
    this.codecs.push(codec);
  }

  find(node: TypeNode): Codec | null {
    return this.codecs.find((c) => c.canHandle(node)) ?? null;
  }

  parse(typeString: string, value: any): any {
    const node = parseType(typeString);
    const codec = this.find(node);
    return codec ? codec.parse(value) : value;
  }

  serialize(typeString: string, value: any): any {
    const node = parseType(typeString);
    const codec = this.find(node);
    return codec ? codec.serialize(value) : value;
  }
}

/** Minimal starter codecs */
export function createDefaultCodecRegistry(): CodecRegistry {
  const reg = new CodecRegistry();

  // Interval: {start,end} <=> [start,end]
  reg.register({
    typeName: "Interval",
    canHandle: (n) => n.kind === "custom" && /Interval$/i.test(n.name),
    parse: (v) => {
      if (Array.isArray(v) && v.length >= 2) return { start: v[0], end: v[1] };
      if (v && typeof v === "object" && "start" in v && "end" in v) return v;
      return { start: null, end: null };
    },
    serialize: (v: any) => [v?.start ?? null, v?.end ?? null],
  });

  // Pair: {first,second} <=> [first,second]
  reg.register({
    typeName: "Pair",
    canHandle: (n) => n.kind === "custom" && /^Pair/i.test(n.name),
    parse: (v) => {
      if (Array.isArray(v) && v.length >= 2) return { first: v[0], second: v[1] };
      if (v && typeof v === "object" && "first" in v && "second" in v) return v;
      return { first: null, second: null };
    },
    serialize: (v: any) => [v?.first ?? null, v?.second ?? null],
  });

  return reg;
}

