interface String {
  split(separator: string | RegExp, limit?: number): [string, ...string[]];
}

interface ObjectConstructor {
  keys(o: any[]): never;
  keys<T>(o: T & (T extends any[] ? never : object)): string[];
  create(o: null): ObjectOf<any>;
}

interface Array<T> {
  at<Arr extends T[], N extends number>(this: Arr, index: N):
    [N, Arr] extends [0, [any, ...any[]]] ? T
    : [N, Arr] extends [-1, [any, ...any[]]] ? T
    : T | undefined;
}

interface JSON {
  stringify<T>(
    value: T,
    replacer?: (this: any, key: string, value: any) => any,
    space?: string | number,
  ): string | (
    T extends undefined | AnyFunction | symbol ? undefined
    : T extends Primitive | ObjectOf<any> | any[] ? never
    : undefined);
  stringify<T>(
    value: T,
    replacer?: (number | string)[] | null,
    space?: string | number,
  ): string | (
    T extends undefined | AnyFunction | symbol ? undefined
    : T extends Primitive | ObjectOf<any> | any[] ? never
    : undefined);
}

// Merge with lib.dom.d.ts
interface RequestInit {
  priority?: 'high' | 'low' | 'auto';
}

interface Navigator {
  readonly userAgentData?: {
    readonly brands: {
      readonly brand: string;
      readonly version: string;
    }[];
    readonly mobile: boolean;
    readonly platform: string;
  };

  readonly virtualKeyboard?: {
    readonly show: () => void;
    readonly hide: () => void;
  };
}
