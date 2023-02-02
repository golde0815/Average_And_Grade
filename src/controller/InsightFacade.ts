import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import JSZip from "jszip";

import fs from "fs-extra";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	constructor() {
		console.log("InsightFacadeImpl::init()");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			if (id.match(/^\s*$/) || id.search("_") > 0 || id.length === 0) {
				reject(new InsightError("Invalid ID"));
			}
			let rows = 0;
			JSZip.loadAsync(content, {base64: true})
				.then(() => {
					if (JSZip.folder("./data/") === null) {
						reject(new InsightError("Invalid content"));
					}
					JSZip.folder("./data/")?.forEach(() => {
						console.log("A");
					});
				}).catch(() => {
					reject(new InsightError("Invalid content"));
				});
			let metadata: InsightDataset;
			metadata = {
				id: id,
				kind: InsightDatasetKind.Sections,
				numRows: 2
			};
			let data = {
				metadata: metadata,
				database: content
			};
			fs.writeFile("./data" + id + ".json", data, (err: InsightError) => {
				if (err) {
					reject(new InsightError("Error adding file"));
				}

				let allDatabases: string[];
				allDatabases = [];
				resolve(allDatabases);
			});
			resolve([]);
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
