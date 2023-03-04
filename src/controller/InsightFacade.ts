import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult, NotFoundError, ResultTooLargeError
} from "./IInsightFacade";
import optionController from "./optionController";
import orderController from "./orderController";
import processWhere from "./processWhere";
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
	private datasets: any;
	constructor() {
		this.datasets = {};
		// if (fs.existsSync("./data")) {
		// 	const files = fs.readdirSync("./data");
		// 	if (files.length > 0) {
		// 		for (const file of files) {
		// 			const dataset = fs.readJsonSync("./data/" + file);
		// 			this.datasets[dataset.id] = dataset;
		// 		}
		// 	}
		// }
		console.log("InsightFacadeImpl::init()");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			if (id.match(/^\s*$/) || id.search("_") > 0 || id.length === 0) {
				reject(new InsightError("Invalid ID"));
			} else if (kind === InsightDatasetKind.Rooms) {
				reject(new InsightError("Invalid Type"));
			}
			if (this.datasets[id]) {
				reject(new InsightError("Duplicate ID"));
			}
			let zip = new JSZip(), dataset = new Dataset(id, kind);
			return zip.loadAsync(content, {base64: true})
				.then(() => {
					if (zip.folder("courses/") === null) {
						reject(new InsightError("Invalid content (no courses)"));
					}
					let promises: Array<Promise<void>> = [];
					zip.folder("courses/")?.forEach((relativePath, file) => {
						let coursePromise: Promise<void> = file.async("string")
							// eslint-disable-next-line max-nested-callbacks
							.then((text) => {
								dataset.addCourse(text);
								// eslint-disable-next-line max-nested-callbacks
							}).catch(() => {
								reject(new InsightError("Invalid course content"));
							});
						promises.push(coursePromise);
					});
					return Promise.all(promises);
				}).then(() => {
					this.datasets[id] = dataset;
					let datasetString = JSON.stringify(dataset);
					if (!fs.existsSync("./data")) {
						fs.mkdir("./data");
					}
					fs.writeFile("./data/" + id + ".json", datasetString, (err: InsightError) => {
						if (err) {
							reject(new InsightError("Error adding file"));
						}
					});
					// console.log(this.datasets);
					resolve(Object.keys(this.datasets));
				}).catch(() => { // implement writing file to disk
					reject(new InsightError("Invalid content"));
				});
		});
	}

	public removeDataset(id: string): Promise<string> {
		if (id.match(/^\s*$/) || id.search("_") > 0 || id.length === 0) {
			return Promise.reject(new InsightError("Invalid ID"));
		}
		if (this.datasets[id] === undefined) {
			return Promise.reject(new NotFoundError("ID not found"));
		}
		delete this.datasets[id];
		return Promise.resolve(id);
	}

	public validateOptions(optionStatement: any) {
		if (Object.keys(optionStatement).length === 1) {
			if (!optionStatement.COLUMNS) {
				throw new InsightError("Invalid key in OPTIONS");
			}
		} else if (Object.keys(optionStatement).length === 2) {
			if (!optionStatement.COLUMNS || !optionStatement.ORDER) {
				throw new InsightError("Invalid key in OPTIONS");
			}
		} else {
			throw new InsightError("OPTIONS should only contain one or two statements");
		}
		return;
	}

	public findID(query: any): string {
		if(query.OPTIONS.COLUMNS && Array.isArray(query.OPTIONS.COLUMNS) && query.OPTIONS.COLUMNS.length > 0) {
			return query.OPTIONS.COLUMNS[0].split("_")[0];
		}
		return "";
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		const anyQuery: any = query;
		let courseData: any = this.datasets;
		if (anyQuery == null) {
			return Promise.reject(new InsightError("Invalid query (null)"));
		}
		if (!anyQuery.WHERE || !anyQuery.OPTIONS) {
			return Promise.reject(new InsightError("No WHERE / OPTION statement in query"));
		}
		if (Object.keys(anyQuery).length !== 2) {
			return Promise.reject(new InsightError("Query should only contain two statements"));
		}
		const id: string = this.findID(anyQuery);
		if (!id) {
			return Promise.reject(new InsightError("Invalid key"));
		}
		let data: any[] = [];
		courseData[id].courses.forEach((eachData: any) => {
			if (eachData["sections"].length > 0) {
				data = data.concat(eachData["sections"]);
			}
		});
		return new Promise<InsightResult[]>((resolve, reject) => {
			try{
				const whereStatement = anyQuery.WHERE;
				let filteredData: any;
				if (Object.keys(whereStatement).length === 0) {
					filteredData = data;
				} else if (Object.keys(whereStatement).length !== 1) {
					throw new InsightError("WHERE can only have one key");
				} else {
					filteredData = processWhere(whereStatement, data, id);
				}
				if (filteredData.length > 5000) {
					throw new ResultTooLargeError("More than 5000 results");
				}
				let finalData: InsightResult[];
				const optionStatement = anyQuery.OPTIONS;
				this.validateOptions(optionStatement);
				finalData = optionController(optionStatement, filteredData,id);
				if (optionStatement.ORDER) {
					finalData = orderController(optionStatement,finalData);
				}
				return resolve(finalData);
			} catch (err) {
				return reject(err);
			}
		});
	}

	public listDatasets(): Promise<InsightDataset[]> {
		let listedResult = Object.keys(this.datasets).map((eachID) => {
			return {
				id: this.datasets[eachID].id,
				kind: this.datasets[eachID].kind,
				numRows: this.datasets[eachID].numRows
			};
		});
		return Promise.resolve(listedResult);
	}
}
