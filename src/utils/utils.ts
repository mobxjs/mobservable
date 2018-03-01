export const EMPTY_ARRAY = []
Object.freeze(EMPTY_ARRAY)

declare var global
export function getGlobal() {
    return typeof window !== "undefined" ? window : global
}

export interface Lambda {
    (): void
    name?: string
}

export function getNextId() {
    return ++globalState.mobxGuid
}

export function fail(message: string, thing?): never {
    invariant(false, message, thing)
    throw "X" // unreachable
}

export function invariant(check: boolean, message: string, thing?) {
    if (!check)
        throw new Error("[mobx] Invariant failed: " + message + (thing ? ` in '${thing}'` : ""))
}

/**
 * Prints a deprecation message, but only one time.
 * Returns false if the deprecated message was already printed before
 */
const deprecatedMessages: string[] = []

export function deprecated(msg: string): boolean {
    if (deprecatedMessages.indexOf(msg) !== -1) return false
    deprecatedMessages.push(msg)
    console.error("[mobx] Deprecated: " + msg)
    return true
}

/**
 * Makes sure that the provided function is invoked at most once.
 */
export function once(func: Lambda): Lambda {
    let invoked = false
    return function() {
        if (invoked) return
        invoked = true
        return (func as any).apply(this, arguments)
    }
}

export const noop = () => {}

export function unique<T>(list: T[]): T[] {
    const res: T[] = []
    list.forEach(item => {
        if (res.indexOf(item) === -1) res.push(item)
    })
    return res
}

export function joinStrings(things: string[], limit: number = 100, separator = " - "): string {
    if (!things) return ""
    const sliced = things.slice(0, limit)
    return `${sliced.join(separator)}${things.length > limit
        ? " (... and " + (things.length - limit) + "more)"
        : ""}`
}

export function isObject(value: any): boolean {
    return value !== null && typeof value === "object"
}

export function isPlainObject(value) {
    if (value === null || typeof value !== "object") return false
    const proto = Object.getPrototypeOf(value)
    return proto === Object.prototype || proto === null
}

export function objectAssign<T extends object>(
    target: { [key: string]: never },
    clonedSource: T,
    ...sources: (Partial<T> & object)[]
): T
export function objectAssign<T extends object>(target: T, ...sources: (Partial<T> & object)[]): T
export function objectAssign() {
    const res = arguments[0]
    for (let i = 1, l = arguments.length; i < l; i++) {
        const source = arguments[i]
        for (let key in source)
            if (hasOwnProperty(source, key)) {
                res[key] = source[key]
            }
    }
    return res
}

const prototypeHasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwnProperty(object: Object, propName: string) {
    return prototypeHasOwnProperty.call(object, propName)
}

export function makeNonEnumerable(object: any, propNames: string[]) {
    for (let i = 0; i < propNames.length; i++) {
        addHiddenProp(object, propNames[i], object[propNames[i]])
    }
}

export function addHiddenProp(object: any, propName: string, value: any) {
    Object.defineProperty(object, propName, {
        enumerable: false,
        writable: true,
        configurable: true,
        value
    })
}

export function addHiddenFinalProp(object: any, propName: string, value: any) {
    Object.defineProperty(object, propName, {
        enumerable: false,
        writable: false,
        configurable: true,
        value
    })
}

export function isPropertyConfigurable(object: any, prop: string): boolean {
    const descriptor = Object.getOwnPropertyDescriptor(object, prop)
    return !descriptor || (descriptor.configurable !== false && descriptor.writable !== false)
}

export function assertPropertyConfigurable(object: any, prop: string) {
    invariant(
        isPropertyConfigurable(object, prop),
        `Cannot make property '${prop}' observable, it is not configurable and writable in the target object`
    )
}

export function createInstanceofPredicate<T>(
    name: string,
    clazz: new (...args: any[]) => T
): (x: any) => x is T {
    const propName = "isMobX" + name
    clazz.prototype[propName] = true
    return function(x) {
        return isObject(x) && x[propName] === true
    } as any
}

export function areBothNaN(a: any, b: any): boolean {
    return typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b)
}

/**
 * Returns whether the argument is an array, disregarding observability.
 */
export function isArrayLike(x: any): x is Array<any> | IObservableArray<any> {
    return Array.isArray(x) || isObservableArray(x)
}

export function isES6Map(thing): boolean {
    if (getGlobal().Map !== undefined && thing instanceof getGlobal().Map) return true
    return false
}

export function getMapLikeKeys<V>(map: ObservableMap<V> | IKeyValueMap<V> | any): string[] {
    if (isPlainObject(map)) return Object.keys(map)
    if (Array.isArray(map)) return map.map(([key]) => key)
    if (isES6Map(map)) return (Array as any).from(map.keys())
    if (isObservableMap(map)) return map.keys()
    return fail("Cannot get keys from " + map)
}

export function iteratorToArray<T>(it: Iterator<T>): ReadonlyArray<T> {
    const res: T[] = []
    while (true) {
        const r: any = it.next()
        if (r.done) break
        res.push(r.value)
    }
    return res
}

declare var Symbol

export function primitiveSymbol() {
    return (typeof Symbol === "function" && Symbol.toPrimitive) || "@@toPrimitive"
}

export function toPrimitive(value) {
    return value === null ? null : typeof value === "object" ? "" + value : value
}

export function stringTagSymbol() {
    return (typeof Symbol === "function" && Symbol.toStringTag) || "@@toStringTag"
}

export function declareStringTag<T>(prototType, tag: string) {
    addHiddenFinalProp(prototType, stringTagSymbol(), tag)
}

import { globalState } from "../core/globalstate"
import { IObservableArray, isObservableArray } from "../types/observablearray"
import { isObservableMap, ObservableMap, IKeyValueMap } from "../types/observablemap"
import { observable } from "../api/observable"
