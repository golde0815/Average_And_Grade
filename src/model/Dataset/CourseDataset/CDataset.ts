import {Course} from "./Course";
import {InsightDatasetKind} from "../../../controller/IInsightFacade";
import JSZip, {JSZipObject} from "jszip";
import {isValidId} from "../../../Utility/General";
import {IDataset, IDatasetParser} from "../IDataset";

export class CDataset implements IDatasetParser{
	public async parseDataset(id: string, content: string): Promise<IDataset> {
		const dataset: IDataset = {id: "", kind: InsightDatasetKind.Sections, dataList: [], numRows: 0};
		let skippedCoursesCount = 0;
		let promises: Array<Promise<any>> = [];
		let sectionsCount = 0;
		let folder: JSZip;

		if (!isValidId(id)) {
			return Promise.reject("Invalid id");
		} else if (!content) {
			return Promise.reject("Empty content");
		}
		try {
			folder = await getContent(content);
		} catch (err) {
			return Promise.reject(err);
		}
		folder.forEach((pathName: string, file: JSZipObject) => {
			promises.push(Course.parseCourse(file)
				.then((course) => {
					dataset.dataList.push(...course.sections);
					sectionsCount += course.sections.length;
				}).catch((err) => {
					// console.log("Invalid Course: " + err);
					// skipping
					skippedCoursesCount++;
				})
			);
		});
		try {
			await Promise.all(promises);
		} catch (err) {
			return Promise.reject(err);
		}
		// console.log(`Skipped ${skippedCoursesCount} sections`);
		if (dataset.dataList.length === 0) {
			return Promise.reject("No valid sections in the dataset");
		}
		dataset.id = id;
		dataset.numRows = sectionsCount;
		return dataset;
	}
}

// ---------- helper functions -----------
function getContent(content: string) {
	const zip = new JSZip();
	return zip.loadAsync(content, {base64: true})
		.then(() => {
			const folders = zip.filter((pathName: string, file: JSZip.JSZipObject) => {
				return (file.name.startsWith("courses/"));
			});
			if (folders.length === 0) {
				return Promise.reject("Zip file is missing the 'courses' folder");
			}
			const folder = zip.folder("courses");
			if (!folder) {
				return Promise.reject("Zip filed is missing the 'courses' folder");
			} else {
				return folder;
			}
		}).catch((err) => {
			return Promise.reject(err);
		});
}
