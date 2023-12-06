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

class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    form: HTMLFormElement;

    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        // accessing the template element (element that wraps all the inputs) and the main app div
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
        this.configure();
        this.attach();
    }

    // gathering user input from the form and validating it
    // returning a tuple with the values entered or void in case of an error
    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        
        if (enteredTitle.trim().length === 0 || enteredDescription.trim().length === 0 || enteredPeople.trim().length === 0) {
            alert("Invalid input, please try again.");
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }

    private clearInputs () {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }

    @autoBind
    private submitHandler(e: Event) {
        e.preventDefault();
        const userInput = this.gatherUserInput();

        // checking if we got a tuple (which is just an array) from the method
        if(Array.isArray(userInput)) {
            // getting the tuple values from userInput constant using destructuring
            const [title, desc, people] = userInput; 
            console.log(title, desc, people);
            this.clearInputs();
        }
    }

    // we are adding an event listener to the form element (configuring)
    private configure() {
        this.form.addEventListener("submit", this.submitHandler);
    }

    // using a method to insert the form to the app div
    private attach() {
        this.hostElement.insertAdjacentElement("afterbegin", this.form);
    }
}

const newProjectInput = new ProjectInput();