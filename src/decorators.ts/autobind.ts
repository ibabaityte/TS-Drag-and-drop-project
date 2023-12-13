// a decorator to use to bind the "this" keyword when it is not interpreted like we would want to
export function autoBind(target: any, name: string | Symbol, descriptor: PropertyDescriptor) {
    const originalMethod: Function = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    }

    return adjustedDescriptor;
}