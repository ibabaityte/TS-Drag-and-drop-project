enum ProjectStatus { Active, Finished };

// A project type
class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) { }
}

type Listener<T> = (items: T[]) => void;

class State<T> {
    // creating an array of listeners to listen if a new project has been added
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

// Project state management class
class ProjectState extends State<Project>{
    private projects: Project[] = [];
    // we can access this instance variable without initiating this class
    private static instance: ProjectState;

    private constructor() {
        super();
    }

    // adding this method, so that it returns an instance of this class if it doesnt exist yet
    static getInstance() {
        if (this.instance) {
            return this.instance
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    // method to add a project to the project list array
    addProject(title: string, description: string, people: number) {
        const newProject = new Project(Math.random().toString(), title, description, people, ProjectStatus.Active);

        this.projects.push(newProject);

        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }

}

// getting an instance of a class so that we make sure we only get one instance of this class
// since this is a project state, we only want one instance in the application
const projectState = ProjectState.getInstance();

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

// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    component: U;

    constructor(
        templateId: string,
        hostElementid: string,
        insertAtStart: boolean,
        newElementId?: string
    ) {
        // accessing the template element (element that wraps the list) and the main app div
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementid)! as T;

        // getting a reference to the template element content and importing it into the document
        const importedNode = document.importNode(this.templateElement.content, true);
        // setting the component variable
        this.component = importedNode.firstElementChild as U;

        if (newElementId) {
            this.component.id = newElementId;
        }

        // invoking this function in the constructor so that it is done once the component is loaded
        this.attach(insertAtStart);
    }

    // rendering the templateElement (which is the project list) to the app div
    private attach(insertAtStart: boolean) {
        this.hostElement.insertAdjacentElement(insertAtStart ? "afterbegin" : "beforeend", this.component);
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

class ProjectItem extends Component <HTMLUListElement, HTMLLIElement> {
    private project: Project;

    get getPeople() {
        if(this.project.people === 1) {
            return "1 person assigned"
        } else {
            return `${this.project.people} people assigned`
        }
    }

    constructor(hostElementId: string, project: Project) {
        super("single-project", hostElementId, false, project.id);
        this.project = project; 

        this.configure();
        this.renderContent();
    }

    configure() {}

    renderContent() {
        this.component.querySelector("h2")!.textContent = this.project.title;
        this.component.querySelector("h3")!.textContent = this.getPeople;
        this.component.querySelector("p")!.textContent = this.project.description;
    }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
    assignedProjects: Project[];

    constructor(private type: "active" | "finished") {
        // calling super() because we are extending the class
        super("project-list", "app", false, `${type}-projects`);

        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    // listing the projects in the DOM
    private renderProjects() {
        const listElement = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;

        listElement.innerHTML = "";

        for (const projectItem of this.assignedProjects) {
            // replacing below code by instantiating an object

            // const listItem = document.createElement("li");
            // listItem.textContent = projectItem.title;
            // listElement?.appendChild(listItem);

            new ProjectItem(this.component.querySelector("ul")!.id, projectItem);
        }
    }

    // adding a new listener function to the project state class 
    configure() {
        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(project => {
                if (this.type === "active") {
                    return project.status === ProjectStatus.Active;
                }
                return project.status === ProjectStatus.Finished;
            });
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    };

    // rendering the actual content list with the heading and the list
    renderContent() {
        const listId = `${this.type}-projects-list`;

        this.component.querySelector("ul")!.id = listId;
        this.component.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS";
    }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
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

    renderContent(): void {}
}

const newProjectInput = new ProjectInput();
const newActiveProjectList = new ProjectList("active");
const newFinishedProjectList = new ProjectList("finished");