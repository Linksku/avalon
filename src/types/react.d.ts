type ReactNode = React.ReactNode;
type ReactElement = React.ReactElement;
type ReactFragment = React.ReactFragment;
type SetState<T> = Stable<React.Dispatch<React.SetStateAction<T>>>;

// eslint-disable-next-line @typescript-eslint/naming-convention
declare class __STABLE {
  private __STABLE: true;
}

type StableObjects =
  | Date
  | Error
  | RegExp;

type Stable<T> = T extends Primitive ? T
  : T extends StableObjects ? T
  : T extends __STABLE ? T
  : T & __STABLE;

type StableTypes = Primitive
  | StableObjects
  | React.ComponentType<any>
  | React.MutableRefObject<any>
  | React.SVGFactory
  | __STABLE;

type StableDependencyList = ReadonlyArray<StableTypes>;

// Doesn't work with generics: https://stackoverflow.com/questions/51300602
type StableObjShallow<Obj extends ObjectOf<any>> = {
  [K in keyof Obj]: Stable<Obj[K]>;
};

type StableDeep<T> =
  T extends Primitive ? T
  : T extends __STABLE ? T
  : Stable<
    T extends Set<infer U> ? Set<Stable<U>>
    : T extends Map<infer K, infer V> ? Map<K, Stable<V>>
    : T extends BuiltInObjects ? T
    : (keyof T) extends never ? T
    : { [K in keyof T]: StableDeep<T[K]> }
  >;

declare namespace React {
  function memo<P extends object>(
    Component: FunctionComponent<P>,
    propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
  ): NamedExoticComponent<{
    [K in keyof P]: P[K] extends StableTypes
      ? P[K]
      : Stable<P[K]>;
  }>;
  function memo<T extends ComponentType<any>, P extends ComponentProps<T>>(
    Component: T,
    propsAreEqual?: (
      prevProps: Readonly<P>,
      nextProps: Readonly<P>,
    ) => boolean
  ): MemoExoticComponent<ComponentType<{
    [K in keyof P]: P[K] extends StableTypes
      ? P[K]
      : Stable<P[K]>;
  }>>;

  // Change type to enable noImpicitAny
  // https://stackoverflow.com/questions/69703041/enable-noimplicitany-for-functions-wrapped-with-usecallback
  function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: StableDependencyList,
  ): Stable<T>;

  function useMemo<T>(
    callback: () => T,
    deps: StableDependencyList,
  ): Stable<T>;

  function useState<S>(
    initialState: S | (() => S),
  ): [
    Stable<
      S extends Primitive ? S
      : (keyof S) extends never ? S
      : StableObjShallow<S>
    >,
    SetState<S>,
  ];

  function useReducer<R extends React.ReducerWithoutAction<any>, I>(
    reducer: R,
    initializerArg: I,
    initializer: (arg: I) => React.ReducerStateWithoutAction<R>
  ): [Stable<React.ReducerStateWithoutAction<R>>, Stable<React.DispatchWithoutAction>];

  function useReducer<R extends React.ReducerWithoutAction<any>>(
    reducer: R,
    initializerArg: React.ReducerStateWithoutAction<R>,
    initializer?: undefined
  ): [Stable<React.ReducerStateWithoutAction<R>>, Stable<React.DispatchWithoutAction>];

  function useReducer<R extends React.Reducer<any, any>>(
    reducer: R,
    initialState: React.ReducerState<R>,
    initializer?: undefined
  ): [Stable<React.ReducerState<R>>, Stable<React.Dispatch<React.ReducerAction<R>>>];

  function useReducer<R extends React.Reducer<any, any>, I>(
    reducer: R,
    initializerArg: I,
    initializer: (arg: I) => React.ReducerState<R>
  ): [Stable<React.ReducerState<R>>, Stable<React.Dispatch<React.ReducerAction<R>>>];

  function useReducer<R extends React.Reducer<any, any>, I>(
    reducer: R,
    initializerArg: I,
    initializer: (arg: I) => React.ReducerState<R>
  ): [Stable<React.ReducerState<R>>, Stable<React.Dispatch<React.ReducerAction<R>>>];

  function useEffect(
    effect: React.EffectCallback,
    deps?: StableDependencyList,
  ): void;

  function useLayoutEffect(
    effect: React.EffectCallback,
    deps?: StableDependencyList,
  ): void;
}
