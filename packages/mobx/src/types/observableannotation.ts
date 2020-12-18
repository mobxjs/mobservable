import {
    ObservableObjectAdministration,
    getDescriptor,
    deepEnhancer,
    die,
    Annotation,
    recordAnnotationApplied
} from "../internal"

export function createObservableAnnotation(name: string, options?: object): Annotation {
    return {
        annotationType_: name,
        options_: options,
        make_,
        extend_
    }
}

function make_(adm: ObservableObjectAdministration, key: PropertyKey): void {
    const descriptor = getDescriptor(adm.target_, key)
    if (descriptor) {
        assertObservableDescriptor(adm, this, key, descriptor)
        const definePropertyOutcome = adm.defineObservableProperty_(
            key,
            descriptor.value,
            this.options_?.enhancer ?? deepEnhancer
        )
        if (!definePropertyOutcome) {
            // Intercepted
            return
        }
        recordAnnotationApplied(adm, this, key)
    } else if (!this.isDecorator_) {
        // Throw on missing key, except for decorators:
        // Decorator annotations are collected from whole prototype chain.
        // When called from super() some props may not exist yet.
        // However we don't have to worry about missing prop,
        // because the decorator must have been applied to something.
        die(1, this.annotationType_, `${adm.name_}.${key.toString()}`)
    }
}

function extend_(
    adm: ObservableObjectAdministration,
    key: PropertyKey,
    descriptor: PropertyDescriptor,
    proxyTrap: boolean
): boolean | null {
    assertObservableDescriptor(adm, this, key, descriptor)
    return adm.defineObservableProperty_(
        key,
        descriptor.value,
        this.options_?.enhancer ?? deepEnhancer,
        proxyTrap
    )
}

function assertObservableDescriptor(
    adm: ObservableObjectAdministration,
    { annotationType_ }: Annotation,
    key: PropertyKey,
    descriptor: PropertyDescriptor
) {
    if (__DEV__ && !("value" in descriptor)) {
        die(
            `Cannot apply '${annotationType_}' to '${adm.name_}.${key.toString()}':` +
                `\n'${annotationType_}' cannot be used on getter/setter properties`
        )
    }
}
