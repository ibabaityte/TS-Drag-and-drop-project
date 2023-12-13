// Component Base Class
export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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