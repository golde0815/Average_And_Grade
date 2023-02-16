import {Course} from "./Course";
import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {Section} from "./Section";

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

	public addCourse(text: string) {
		let courseData = JSON.parse(text);
		let sections: Section[];
		sections = [];
		for (const secData of courseData.result) {
			let section = new Section(secData.id, secData.Course, secData.Title,
				secData.Professor, secData.Subject, secData.Year, secData.Avg, secData.Pass,
				secData.Fail, secData.Audit, secData.Section);
			sections.push(section);
		}
		let course = new Course(sections);
		this.courses.push(course);
		this.numRows += course.getRows();
	}
	public setCourses(courses: Course[]) {
		this.courses = courses;
	}
	public setRows(rows: number) {
		this.numRows = rows;
	}
}
