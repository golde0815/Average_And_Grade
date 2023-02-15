import {ISection, Section} from "./Section";
import JSZip from "jszip";

export interface ICourse {
	sections: ISection[]
}

export class Course {
	public static async parseCourse(file: JSZip.JSZipObject): Promise<ICourse> {
		const course: ICourse = {sections:[]};
		let skippedSectionsCount: number = 0;
		let promises: Array<Promise<any>> = [];
		let results: object[];

		try {
			results = await getContent(file);
		} catch (err) {
			return Promise.reject(err);
		}
		results.forEach((item) => {
			promises.push(Section.parseSection(item)
				.then((section) => {
					course.sections.push(section);
				}).catch((err)=> {
					// console.log("Invalid Section: " + err);
					// skipping
					skippedSectionsCount++;
				})
			);
		});
		try {
			await Promise.all(promises);
		} catch (err) {
			return Promise.reject(err);
		}
		// console.log(`Skipped ${skippedSectionsCount} sections`);
		if (course.sections.length > 0) {
			// console.log(`Returning a course with ${course.sections.length} sections.`);
			return course;
		}
		return Promise.reject("No valid Sections in the course");
	}
}

// ---------- helper functions -----------
function getContent(file: JSZip.JSZipObject): Promise<object[]> {
	return new Promise ((resolve, reject) => {
		resolve(null);
	}).then(()=> {
		return file.async("string");
	}).then((cont)=> {
		return JSON.parse(cont);
	}).then((json) => {
		if (!(json && "result" in json && "rank" in json && Array.isArray(json.result) )) {
			return Promise.reject("File's JSON content is not representing a Course");
		}
		return json.result as any[];
	}).catch((err) => {
		return Promise.reject(err);
	});
}
