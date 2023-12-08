// writting an interface for the object that will be used to pass into the validate function
// with all the information needed for validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

// validation function  for the user input
function validate(validatableInput: Validatable) {
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

// a decorator to use to bind the "this" keyword when it is not interpreted like we would want to
function autoBind(target: any, name: string | Symbol, descriptor: PropertyDescriptor) {
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

class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    listSection: HTMLElement;

    constructor(private type: "active" | "finished") {
        // accessing the template element (element that wraps the list) and the main app div
        this.templateElement = document.getElementById("project-list")! as HTMLTemplateElement;
        this.hostElement = document.getElementById("app")! as HTMLDivElement;

        // getting a reference to the template element content and importing it into the document
        const importedNode = document.importNode(this.templateElement.content, true);
        // setting the element variable
        this.listSection = importedNode.firstElementChild as HTMLElement;
        this.listSection.id = `${this.type}-projects`;

        // rendering the templateElement (which is the project list) to the app div
        this.attach();
        // rendering the actual content list with the heading and the list
        this.renderContent();
    }

    private attach() {
        this.hostElement.insertAdjacentElement("beforeend", this.listSection);
    }

    private renderContent() {
        const listId = `${this.type}-projects-list`;

        console.log(this.listSection);
        
        this.listSection.querySelector("ul")!.id = listId;
        this.listSection.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS";
    }
}

class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    form: HTMLFormElement;

    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        // accessing the template element (el ement that wraps all the inputs) and the main app div
        this.templateElement = document.getElementById("project-input")! as HTMLTemplateElement;
        this.hostElement = document.getElementById("app")! as HTMLDivElement;

        // getting a reference to the template element content and importing it into the document
        const importedNode = document.importNode(this.templateElement.content, true);
        // setting the element variable
        this.form = importedNode.firstElementChild as HTMLFormElement;
        this.form.id = "user-input";

        // accessing all the input elements
        this.titleInputElement = this.form.querySelector("#title")! as HTMLInputElement;
        this.descriptionInputElement = this.form.querySelector("#description")! as HTMLInputElement;
        this.peopleInputElement = this.form.querySelector("#people")! as HTMLInputElement;

        // invoking these functions in the constructor so that it is done once the form is loaded
        // displays the form
        this.attach();
        // listens to form submit handler
        this.configure();
    }

    // gathering user input from the form and validating it
    // returning a tuple with the values entered or void in case of an error
    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        }
        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }
        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        }

        // if any of the validate() functions return false, then we alert about the error
        if (!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)) {
            alert("Invalid input, please try again.");
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }

    // clearing the inputs after submitting
    private clearInputs() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }

    // using autobind Decorator to bing the "this" keyword when we are using this method in the configure() method
    @autoBind
    private submitHandler(e: Event) {
        e.preventDefault();
        const userInput = this.gatherUserInput();

        // checking if we got a tuple (which is just an array) from the method
        if (Array.isArray(userInput)) {
            // getting the tuple values from userInput constant using destructuring
            const [title, desc, people] = userInput;
            console.log(title, desc, people);
            this.clearInputs();
        }
    }

    // we are adding an event listener to the form element (configuring)
    private configure() {
        // this.submitHandler automatically returns null. because "this" refers to the "addEventListener" methods instance
        // therefore "this.submitHandler" does not work as intended
        // we could do: 
        // this.form.addEventListener("submit", this.submitHandler.bind(this));
        // but we are using the Decorator autobind in the submitHandler() method initiation, and that solves the problem
        // and we can also reuse the decorator in other places
        this.form.addEventListener("submit", this.submitHandler);
    }

    // using a method to insert the form to the app div
    private attach() {
        this.hostElement.insertAdjacentElement("afterbegin", this.form);
    }
}

const newProjectInput = new ProjectInput();
const newActiveProjectList = new ProjectList("active");
const newFinishedProjectList = new ProjectList("finished");