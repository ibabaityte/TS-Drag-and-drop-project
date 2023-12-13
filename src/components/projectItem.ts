import { Component } from "../components/baseComponent";
import { Project } from '../models/project';
import { autoBind } from "../decorators.ts/autobind";
import { Draggable } from "../models/dragDropInterfaces";

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    private project: Project;

    get getPeople() {
        if (this.project.people === 1) {
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

    @autoBind
    dragStartHandler(event: DragEvent) {
        event.dataTransfer!.setData("text/plain", this.project.id);
        event.dataTransfer!.effectAllowed = "move";
    }

    dragEndHandler(_event: DragEvent) {
    }

    configure() {
        this.component.addEventListener("dragstart", this.dragStartHandler);
        this.component.addEventListener("dragend", this.dragEndHandler);
    }

    renderContent() {
        this.component.querySelector("h2")!.textContent = this.project.title;
        this.component.querySelector("h3")!.textContent = this.getPeople;
        this.component.querySelector("p")!.textContent = this.project.description;
    }
}