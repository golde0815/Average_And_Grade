import {Section} from "./Section";

export class Course {
	private readonly sections: Section[];
	constructor(sections: Section[]) {
		this.sections = sections;
	}
	public getRows() {
		return this.sections.length;
	}
}
