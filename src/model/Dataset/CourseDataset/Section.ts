import {IData} from "../IDataset";

export interface ISection extends IData {
	dept: string,   	// The department that offered the section. i.e. CPSC, BIOL, ...
	id: string, 		// The course number (will be treated as a string (e.g., 499b)).
	avg: number,		// The average of the section offering.
	instructor: string,	// The instructor teaching the section offering.
	title: string, 		// The name of the course.
	pass: number,		// The number of students that passed the section offering.
	fail: number,		// The number of students that failed the section offering.
	audit: number,		// The number of students that audited the section offering.
	uuid: string,		// The unique id of a section on offering.
	year: number		// The year the section offering ran.
}

export type SectionFieldType = keyof typeof Section.fieldNameAndType;

export class Section {
	public static fieldNameAndType = {
		dept: ["Subject", "s"],
		id: ["Course", "s"],
		avg: ["Avg", "n"],
		instructor: ["Professor", "s"],
		title: ["Title", "s"],
		pass: ["Pass", "n"],
		fail: ["Fail", "n"],
		audit: ["Audit", "n"],
		uuid: ["id", "s"],
		year: ["Year", "n"]
	};

	public static async parseSection(json: any): Promise<ISection> {
		const section: any = {};

		// Validate that the json is representing a valid Course
		if (!json) {
			return Promise.reject("Section is null or empty");
		}
		for (let field in this.fieldNameAndType) {
			if (!(this.fieldNameAndType[field as SectionFieldType][0] in json)) {
				return Promise.reject("Missing fields in the Section");
			}
		}
		// At this point, json is a valid Course
		for (let field in this.fieldNameAndType) {
			if (this.fieldNameAndType[field as SectionFieldType][1] === "s") {
				section[field] = (json[this.fieldNameAndType[field as SectionFieldType][0]]).toString();
			} else {
				section[field] = Number(json[this.fieldNameAndType[field as SectionFieldType][0]]);
			}
		}
		if ("Section" in json && json.Section === "overall") {
			section.year = 1900;
		}
		return section as ISection;
	}
}
