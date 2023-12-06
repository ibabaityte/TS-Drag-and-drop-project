class ProjectInput {
    templateElement: HTMLTemplateElement; 
    hostElement: HTMLDivElement;
    element: HTMLFormElement;

    constructor() {
        // accessing the template element (element that wraps all the inputs) and the main app div
        this.templateElement = document.getElementById("project-input")! as HTMLTemplateElement;
        this.hostElement = document.getElementById("app")! as HTMLDivElement;

        // getting a reference to the template element content and importing it into the document
        const importedNode = document.importNode(this.templateElement.content, true);
        // setting the element variable
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = "user-input";

        // because we want the project input to be seen as soon as we instantiate ProjectInput
        // we will render the form in the constructor
        this.attach();
    }

    private attach() {
        // using a method to insert the form to the app div
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
    }
}

const newProjectInput = new ProjectInput();