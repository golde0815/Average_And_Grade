import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult, ResultTooLargeError
} from "./IInsightFacade";
import isController from "./isController";
import eqController from "./eqController";
import gtController from "./gtController";
import optionController from "./optionController";
import orderController from "./orderController";
import ltController from "./ltController";
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
					resolve(Object.keys(this.datasets));
				});
		});
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.resolve("Not implemented.");
	}
	public andController(query: any, data: any): any {
		if (query.length !== 2) {
			throw new InsightError("There should be only two sub-queries for AND");
		}
		data = this.processWhere(query[0], data);
		data = this.processWhere(query[1], data);
		return data;
	}
	public orController(query: any, data: any): any {
		if (query.length !== 2) {
			throw new InsightError("There should be only two sub-queries for OR");
		}
		const processedDataFirst = this.processWhere(query[0], data);
		let mergedSet = new Set();
		if (processedDataFirst.length > 0) {
			processedDataFirst.forEach((eachData: any) => mergedSet.add(eachData));
		}
		const processedDataSecond = this.processWhere(query[1], data);
		if (processedDataSecond.length > 0) {
			processedDataSecond.forEach((eachData: any) => mergedSet.add(eachData));
		}
		return Array.from(mergedSet);
	}
	public processWhere(whereStatement: any, filteredData: any) {
		let processedData: any = filteredData;
		if (!whereStatement.AND && !whereStatement.OR && !whereStatement.NOT && !whereStatement.GT &&
			!whereStatement.LT && !whereStatement.IS && !whereStatement.EQ) {
			throw new InsightError("Invalid key in where");
		}
		if (whereStatement.AND) {
			processedData = this.andController(whereStatement.AND, processedData);
		}
		if (whereStatement.OR) {
			processedData = this.orController(whereStatement.OR, processedData);
		}
		if (whereStatement.NOT) {
			if (Object.keys(whereStatement.NOT).length !== 1) {
				throw new InsightError("NOT can only have one key");
			}
			let dataToExclude: any;
			dataToExclude = this.processWhere(whereStatement.NOT, processedData);
			processedData = processedData.filter(function(eachData: any) {
				if (dataToExclude.indexOf(eachData) > -1){
					return false;
				} else {
					return true;
				}
			});
		}
		if (whereStatement.GT) {
			processedData = gtController(whereStatement.GT, processedData);
		}
		if (whereStatement.LT) {
			processedData = ltController(whereStatement.LT, processedData);
		}
		if (whereStatement.IS) {
			processedData = isController(whereStatement.IS,processedData);
		}
		if (whereStatement.EQ) {
			processedData = eqController(whereStatement.EQ, processedData);
		}
		return processedData;
	}
	public validateOptions(optionStatement: any) {
		if (!optionStatement.COLUMNS || !optionStatement.ORDER) {
			throw new InsightError("Invalid key in OPTIONS");
		}
		if (Object.keys(optionStatement).length !== 2) {
			throw new InsightError("OPTIONS should only contain two statements");
		}
		if ((optionStatement.COLUMNS.find((element: string) => element === optionStatement.ORDER)) === undefined) {
			throw new InsightError("ORDER Key must be in Columns");
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
			if (eachData[id].length > 0) {
				data = data.concat(eachData[id]);
			}
		});
		return new Promise<InsightResult[]>((resolve, reject) => {
			try{
				const whereStatement = anyQuery.WHERE;
				// console.log("Inside WHERE:", anyQuery.WHERE);
				if (Object.keys(whereStatement).length !== 1) {
					throw new InsightError("WHERE can only have one key");
				}
				let filteredData: any;
				filteredData = this.processWhere(whereStatement, data);
				if (filteredData.length > 5000) {
					throw new ResultTooLargeError("More than 5000 results");
				}
				let finalData: InsightResult[];
				// console.log("filteredData: ", filteredData);
				const optionStatement = anyQuery.OPTIONS;
				this.validateOptions(optionStatement);
				finalData = optionController(optionStatement, filteredData);
				finalData = orderController(optionStatement.ORDER,finalData);
				return resolve(finalData);
			} catch (err) {
				return reject(err);
			}
		});
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve([]);
	}
}
