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
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockData = require("./data");
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
						console.log("this part is not running properly");
					});
				}).catch(() => {
					reject(new InsightError("Invalid content"));
				}).then(() => {
				// implement writing file to disk
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
		// return Promise.resolve([]);
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.resolve("Not implemented.");
	}
	public processWhere(whereStatement: any, filteredData: any) {
		let processedData: any = filteredData;
		if (!whereStatement.AND && !whereStatement.OR && !whereStatement.NOT && !whereStatement.GT &&
			!whereStatement.LT && !whereStatement.IS && !whereStatement.EQ) {
			throw new InsightError("Invalid key in where");
		}
		if (whereStatement.AND) {
			if (whereStatement.AND.length !== 2) {
				throw new InsightError("There should be only two sub-queries for AND");
			}
			processedData = this.processWhere(whereStatement.AND[0], filteredData);
			processedData = this.processWhere(whereStatement.AND[1], processedData);
		}
		if (whereStatement.OR) {
			if (whereStatement.OR.length !== 2) {
				throw new InsightError("There should be only two sub-queries for OR");
			}
			processedData = this.processWhere(whereStatement.OR[0], filteredData);
			if (processedData.length === 0) {
				processedData = this.processWhere(whereStatement.OR[1], filteredData);
			}
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
	public performQuery(query: unknown): Promise<InsightResult[]> {
		const anyQuery: any = query;
		let data: any = mockData;
		if (anyQuery == null) {
			return Promise.reject(new InsightError("Invalid query (null)"));
		}
		if (!anyQuery.WHERE || !anyQuery.OPTIONS) {
			return Promise.reject(new InsightError("No WHERE / OPTION statement in query"));
		}
		if (Object.keys(anyQuery).length !== 2) {
			return Promise.reject(new InsightError("Query should only contain two statements"));
		}

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
