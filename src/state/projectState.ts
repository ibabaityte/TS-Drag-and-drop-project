import { Project, ProjectStatus } from "../models/project";

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

        this.updateListeners();
    }

    moveProject(projectId: string, newStatus: ProjectStatus) {
        const project = this.projects.find(project => project.id === projectId)

        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }

    private updateListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }

}

// getting an instance of a class so that we make sure we only get one instance of this class
// since this is a project state, we only want one instance in the application
export const projectState = ProjectState.getInstance();