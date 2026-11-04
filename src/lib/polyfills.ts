/**
 * Polyfills for built-ins missing in older browsers (e.g. Firefox 83).
 *
 * Imported as the very first module of src/index.jsx so it runs before any
 * dependency is evaluated. Vite only transpiles syntax, never adds missing
 * built-ins, so without this dependencies that call these methods break at
 * runtime: tiptap's Editor.dispatchTransaction calls `Array.prototype.findLast`
 * on every transaction, and a throw there means `onUpdate` never fires and
 * typed text never reaches form state.
 *
 * Each method is installed only when absent, non-enumerable (like the native
 * ones) and following the ECMAScript spec. Keep this file free of syntax
 * those browsers cannot parse (private fields, static blocks).
 */

type Predicate = (value: unknown, index: number, array: unknown) => unknown;

const define = (target: object, name: string, value: unknown) => {
  if (typeof (target as Record<string, unknown>)[name] === "function") return;

  Object.defineProperty(target, name, {
    value,
    writable: true,
    configurable: true,
    enumerable: false,
  });
};

// ToIntegerOrInfinity: NaN and undefined become 0, fractions are truncated.
const toIntegerOrInfinity = (value: unknown): number => {
  const number = Number(value);
  return Number.isNaN(number) ? 0 : Math.trunc(number);
};

const toLength = (value: unknown): number => {
  const length = toIntegerOrInfinity(value);
  return length <= 0 ? 0 : Math.min(length, Number.MAX_SAFE_INTEGER);
};

const toObject = (value: unknown, method: string): ArrayLike<unknown> => {
  if (value === null || value === undefined) {
    throw new TypeError(`${method} called on null or undefined`);
  }
  return Object(value);
};

function arrayAt(this: unknown, index: unknown): unknown {
  const object = toObject(this, "Array.prototype.at");
  const length = toLength(object.length);
  const relative = toIntegerOrInfinity(index);
  const k = relative >= 0 ? relative : length + relative;
  return k < 0 || k >= length ? undefined : object[k];
}

function stringAt(this: unknown, index: unknown): string | undefined {
  const string = String(toObject(this, "String.prototype.at"));
  const relative = toIntegerOrInfinity(index);
  const k = relative >= 0 ? relative : string.length + relative;
  return k < 0 || k >= string.length ? undefined : string.charAt(k);
}

const findLastFrom = (
  self: unknown,
  method: string,
  predicate: unknown,
  thisArg: unknown,
): { index: number; value: unknown } => {
  const object = toObject(self, method);
  const length = toLength(object.length);
  if (typeof predicate !== "function") {
    throw new TypeError(`${method}: predicate is not a function`);
  }
  for (let index = length - 1; index >= 0; index--) {
    const value = object[index];
    if ((predicate as Predicate).call(thisArg, value, index, object)) {
      return { index, value };
    }
  }
  return { index: -1, value: undefined };
};

function findLast(this: unknown, predicate: unknown, thisArg?: unknown) {
  return findLastFrom(this, "Array.prototype.findLast", predicate, thisArg)
    .value;
}

function findLastIndex(this: unknown, predicate: unknown, thisArg?: unknown) {
  return findLastFrom(this, "Array.prototype.findLastIndex", predicate, thisArg)
    .index;
}

define(Array.prototype, "at", arrayAt);
define(Array.prototype, "findLast", findLast);
define(Array.prototype, "findLastIndex", findLastIndex);
define(String.prototype, "at", stringAt);

// tiptap also calls Object.hasOwn (Firefox 92+) when an editor uses schemaSpec.
define(Object, "hasOwn", function hasOwn(object: unknown, key: PropertyKey) {
  return Object.prototype.hasOwnProperty.call(
    toObject(object, "Object.hasOwn"),
    key,
  );
});
