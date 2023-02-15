import {Course} from "./Course";
import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";

export class Dataset implements InsightDataset{
	public id: string;
	public kind: InsightDatasetKind;
	public numRows: number;
	public courses: Course[];

	constructor(id: string, kind: InsightDatasetKind) {
		this.id = id;
		this.kind = kind;
		this.courses = [];
		this.numRows = 0;
	}
	public addCourse(course: Course) {
		this.courses.push(course);
		this.numRows += course.getRows();
	}

	public getID() {
		return this.id;
	}
}
