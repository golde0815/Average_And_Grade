import {Course} from "./Course";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import {Section} from "./Section";
import JSZip from "jszip";

export class DatasetSections implements InsightDataset{
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


	public courseHelper(zip: JSZip): Promise<void[]> {
		return new Promise<void[]>((resolve, reject) => {
			if (zip.folder("courses/") === null) {
				reject(new InsightError("Invalid content (no courses)"));
			}
			let promises: Array<Promise<void>> = [];
			zip.folder("courses/")?.forEach((relativePath, file) => {
				let coursePromise: Promise<void> = file.async("string")
					.then((text) => {
						this.addCourse(text);
					}).catch(() => {
						reject(new InsightError("Invalid course content"));
					});
				promises.push(coursePromise);
			});
			resolve(Promise.all(promises));
		});
	}
}
