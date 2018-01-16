import { IObservableArray, IArrayWillChange, IArrayWillSplice } from "../types/observablearray"
import { ObservableMap, IMapWillChange } from "../types/observablemap"
import { IObjectWillChange } from "../types/observableobject"
import { getAdministration } from "../types/type-utils"
import { IObservableValue, IValueWillChange, IInterceptor } from "../../mobx-core"
import { Lambda } from "../mobx"

export function intercept<T>(
	value: IObservableValue<T>,
	handler: IInterceptor<IValueWillChange<T>>
): Lambda
export function intercept<T>(
	observableArray: IObservableArray<T>,
	handler: IInterceptor<IArrayWillChange<T> | IArrayWillSplice<T>>
): Lambda
export function intercept<T>(
	observableMap: ObservableMap<T>,
	handler: IInterceptor<IMapWillChange<T>>
): Lambda
export function intercept<T>(
	observableMap: ObservableMap<T>,
	property: string,
	handler: IInterceptor<IValueWillChange<T>>
): Lambda
export function intercept(object: Object, handler: IInterceptor<IObjectWillChange>): Lambda
export function intercept<T extends Object, K extends keyof T>(
	object: T,
	property: K,
	handler: IInterceptor<IValueWillChange<any>>
): Lambda
export function intercept(thing, propOrHandler?, handler?): Lambda {
	if (typeof handler === "function") return interceptProperty(thing, propOrHandler, handler)
	else return interceptInterceptable(thing, propOrHandler)
}

function interceptInterceptable(thing, handler) {
	return getAdministration(thing).intercept(handler)
}

function interceptProperty(thing, property, handler) {
	return getAdministration(thing, property).intercept(handler)
}
