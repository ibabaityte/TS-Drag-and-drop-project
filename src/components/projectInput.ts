import { Component } from "../components/baseComponent";
import { autoBind } from "../decorators.ts/autobind";
import { projectState } from "../state/projectState";
import * as Validation from "../utils/validation";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super("project-input", "app", true, "user-input");

        // accessing all the input elements
        this.titleInputElement = this.component.querySelector("#title")! as HTMLInputElement;
        this.descriptionInputElement = this.component.querySelector("#description")! as HTMLInputElement;
        this.peopleInputElement = this.component.querySelector("#people")! as HTMLInputElement;


        this.configure();
    }

    // gathering user input from the form and validating it
    // returning a tuple with the values entered or void in case of an error
    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable: Validation.Validatable = {
            value: enteredTitle,
            required: true
        }
        const descriptionValidatable: Validation.Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }
        const peopleValidatable: Validation.Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        }
    
        // if any of the validate() functions return false, then we alert about the error
        if (!Validation.validate(titleValidatable) || !Validation.validate(descriptionValidatable) || !Validation.validate(peopleValidatable)) {
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
            projectState.addProject(title, desc, people);
            this.clearInputs();
        }
    }

    // we are adding an event listener to the form element (configuring)
    configure() {
        // this.submitHandler automatically returns null. because "this" refers to the "addEventListener" methods instance
        // therefore "this.submitHandler" does not work as intended
        // we could do: 
        // this.form.addEventListener("submit", this.submitHandler.bind(this));
        // but we are using the Decorator autobind above the submitHandler() method initiation, and that solves the problem
        // and we can also reuse the decorator in other places
        this.component.addEventListener("submit", this.submitHandler);
    }

    renderContent(): void { }
}