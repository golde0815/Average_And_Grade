import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult} from "./IInsightFacade";

import {Dataset} from "./Dataset";

import JSZip from "jszip";

import fs from "fs-extra";

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
			} else if (kind === InsightDatasetKind.Rooms) {
				reject(new InsightError("Invalid Type"));
			}
			for (const x of this.datasets) {
				if (id === x.getID()) {
					reject(new InsightError("Duplicate ID"));
				}
			}
			let zip = new JSZip();
			let dataset = new Dataset(id, kind);
			return zip.loadAsync(content, {base64: true})
				.then(() => {
					if (zip.folder("courses/") === null) {
						reject(new InsightError("Invalid content (no courses)"));
					}
					let promises: Array<Promise<void>> = [];
					zip.folder("courses/")?.forEach((relativePath, file) => {
						let coursePromise: Promise<void> = file.async("string")
							.then((text) => {
								dataset.addCourse(text);
							}).catch(() => {
								reject(new InsightError("Invalid course content"));
							});
						promises.push(coursePromise);
					});
					return Promise.all(promises);
				}).catch(() => {
					reject(new InsightError("Invalid content"));
				}).then(() => { // implement writing file to disk
					this.datasets.push(dataset);
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
		return Promise.resolve("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {

		return Promise.resolve([]);
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve([]);
	}
}
