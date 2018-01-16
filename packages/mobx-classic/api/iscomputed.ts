import { isObservableObject } from "../types/observableobject"
import { getAtom } from "../types/type-utils"
import { isComputedValue } from "../../mobx-core"

export function isComputed(value, property?: string): boolean {
	if (value === null || value === undefined) return false
	if (property !== undefined) {
		if (isObservableObject(value) === false) return false
		if (!value.$mobx.values[property]) return false
		const atom = getAtom(value, property)
		return isComputedValue(atom)
	}
	return isComputedValue(value)
}
