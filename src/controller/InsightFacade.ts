import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";

import {Dataset} from "./Dataset";

import JSZip from "jszip";

import fs from "fs-extra";
import {Course} from "./Course";
import {Section} from "./Section";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private datasets: Dataset[];
	constructor() {
		this.datasets = [];
		console.log("InsightFacadeImpl::init()");
	}
	// Write tests, write to data directory
	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			if (id.match(/^\s*$/) || id.search("_") > 0 || id.length === 0) {
				reject(new InsightError("Invalid ID"));
			}
			let zip = new JSZip();
			let dataset = new Dataset(id, kind);
			zip.loadAsync(content, {base64: true})
				.then(() => {
					if (zip.folder("./courses/") === null) {
						reject(new InsightError("Invalid content"));
					}
					zip.folder("./courses/")?.forEach((relativePath, file) => {
						console.log(relativePath);
						file.async("string")
							.then((text) => {
								let courseData = JSON.parse(text);
								let sections: Section[];
								sections = [];
								for (const secData of courseData.result) {
									let section = new Section(secData.id, secData.Course, secData.Title,
										secData.Professor, secData.Subject, secData.Year, secData.Avg, secData.Pass,
										secData.Fail, secData.Audit);
									sections.push(section);
								}
								dataset.addCourse(new Course(sections));
							}).catch(() => {
								reject(new InsightError("Invalid course content"));
							});
						this.datasets.push(dataset);
					});
				}).catch(() => {
					reject(new InsightError("Invalid content"));
				}).then(() => {
					// implement writing file to disk
					let datasetString = JSON.stringify(dataset);
					fs.writeFile("./data" + id + ".json", datasetString, (err: InsightError) => {
						if (err) {
							reject(new InsightError("Error adding file"));
						}
					});
					let output: string[] = [];
					for (const x of this.datasets) {
						let datasetId = x.getID();
						output.push(datasetId);
					}
					resolve(output);
				});
		});
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
