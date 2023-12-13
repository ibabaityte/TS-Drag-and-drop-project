import { Component } from "./baseComponent";
import { Project, ProjectStatus } from "../models/project";
import { ProjectItem } from "../components/projectItem";
import { autoBind } from "../decorators.ts/autobind";
import { DragTarget } from "../models/dragDropInterfaces";
import { projectState } from "../state/projectState";

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[];

    constructor(private type: "active" | "finished") {
        // calling super() because we are extending the class
        super("project-list", "app", false, `${type}-projects`);

        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    @autoBind
    dragOverHandler(event: DragEvent) {
        if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            event.preventDefault();
            const listElement = this.component.querySelector("ul")!;
            listElement.classList.add("droppable");
        }

    }

    @autoBind
    dragLeaveHandler(_event: DragEvent) {
        const listElement = this.component.querySelector("ul")!;

        listElement.classList.remove("droppable");
    }

    @autoBind
    dropHandler(event: DragEvent) {
        const projectId = event.dataTransfer!.getData("text/plain");
        const listElement = this.component.querySelector("ul")!;

        projectState.moveProject(projectId, this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished);
        listElement.classList.remove("droppable");
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
        this.component.addEventListener("dragover", this.dragOverHandler);
        this.component.addEventListener("dragleave", this.dragLeaveHandler);
        this.component.addEventListener("drop", this.dropHandler);

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