// writting an interface for the object that will be used to pass into the validate function
// with all the information needed for validation
export interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

// validation function  for the user input
export function validate(validatableInput: Validatable) {
    let isValid = true;
    // using an object of type Validatable to provide this function with all info needed
    const { value, required, minLength, maxLength, min, max } = validatableInput;

    // using object property values to validate inputs on different aspects
    // if either of the properties (required, minLength, maxLength, min and max) are provided to the object through arguments
    // then we check and validate by it 
    if (required) {
        isValid = isValid && value.toString().trim().length !== 0
    }
    if (minLength != null && typeof value === "string") {
        isValid = isValid && value.length >= minLength;
    }
    if (maxLength != null && typeof value === "string") {
        isValid = isValid && value.length <= maxLength;
    }
    if (min != null && typeof value === "number") {
        isValid = isValid && value >= min;
    }
    if (max != null && typeof value === "number") {
        isValid = isValid && value <= max;
    }

    return isValid;
}