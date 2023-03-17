import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "./IInsightFacade";
import optionController from "./optionController";
import orderController from "./orderController";
import processWhere from "./processWhere";
import {DatasetSections} from "./DatasetSections";
import JSZip from "jszip";
import fs from "fs-extra";
import {DatasetRooms} from "./DatasetRooms";
import processTransformation from "./processTransformation";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private datasets: any;
	constructor() {
		this.datasets = {};
		if (fs.existsSync("./data")) {
			const files = fs.readdirSync("./data");
			if (files.length > 0) {
				for (const file of files) {
					const dataset = fs.readJsonSync("./data/" + file);
					this.datasets[dataset.id] = dataset;
				}
			}
		}
		console.log("InsightFacadeImpl::init()");
	}


	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			if (id.match(/^\s*$/) || id.search("_") > 0 || id.length === 0) {
				return reject(new InsightError("Invalid ID"));
			}
			if (this.datasets[id]) {
				return reject(new InsightError("Duplicate ID"));
			}
			let dataset: any;
			let zip = new JSZip();
			if (kind === InsightDatasetKind.Rooms) {
				dataset = new DatasetRooms(id, kind);
			} else {
				dataset = new DatasetSections(id, kind);
			}
			return zip.loadAsync(content, {base64: true})
				.then(() => {
					if (kind === InsightDatasetKind.Sections) {
						return dataset.courseHelper(zip);
					} else {
						return dataset.buildingsHelper(zip);
					}
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
					// let a = this.datasets.valid.buildings.filter((building: any) => building.rooms.length > 0);
					// console.log(a);
					resolve(Object.keys(this.datasets));
				}).catch((error) => { // implement writing file to disk
					reject(new InsightError("Issue with writing file" + error));
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

	public findID(query: any): any {
		let queryKey: string;
		let queryType: InsightDatasetKind;
		const validSFields: string[] = ["uuid","id","title","instructor","dept","year","avg","pass","fail","audit"];
		const validRFields: string[] = ["fullname","shortname","number","name","address","lat","lon","seats",
			"type","furniture","href"];
		if(query.OPTIONS.COLUMNS && Array.isArray(query.OPTIONS.COLUMNS) && query.OPTIONS.COLUMNS.length > 0) {
			queryKey = query.OPTIONS.COLUMNS[0];
		} else {
			throw new InsightError("Invalid option");
		}
		let queryKeyIdAndType: string[] = queryKey.split("_");
		if (queryKeyIdAndType.length === 2) {
			queryKey = queryKeyIdAndType[0];
		} else {
			throw new InsightError("Invalid key in query");
		}
		if (validSFields.includes(queryKeyIdAndType[1])) {
			queryType = InsightDatasetKind.Sections;
		} else if (validRFields.includes(queryKeyIdAndType[1])) {
			queryType = InsightDatasetKind.Rooms;
		} else {
			throw new InsightError("Invalid dataset type for query");
		}
		let filteredDataset: Array<{id: string; kind: InsightDatasetKind;}> = [];
		Object.keys(this.datasets).forEach((datasetIndicies: any) => {
			if (this.datasets[datasetIndicies].id === queryKey && this.datasets[datasetIndicies].kind === queryType) {
				let queryObject: {id: string; kind: InsightDatasetKind;} = {
					id: this.datasets[datasetIndicies].id,
					kind: this.datasets[datasetIndicies].kind
				};
				filteredDataset.push(queryObject);
			}
		});
		if (filteredDataset.length !== 1) {
			throw new InsightError("The corresponding dataset is not added");
		}
		return filteredDataset[0];
	}

	public validateQuery (anyQuery: any) {
		if (anyQuery == null || (!(typeof anyQuery === "object"))) {
			throw new InsightError("Invalid query");
		}
		if (!anyQuery.WHERE || !anyQuery.OPTIONS) {
			throw new InsightError("No WHERE / OPTION statement in query");
		}
		if (Object.keys(anyQuery).length !== 2) {
			if (Object.keys(anyQuery).length === 3 && anyQuery.TRANSFORMATIONS) {
				if (!(typeof anyQuery.TRANSFORMATIONS === "object")) {
					throw new InsightError("TRANSFORMATIONS should be an object");
				}
			} else {
				throw new InsightError("Query should contain two statements or Transformations");
			}
		}
		if (!(typeof anyQuery.WHERE === "object")) {
			throw new InsightError("WHERE should be an object");
		}
		if (!(typeof anyQuery.OPTIONS === "object")) {
			throw new InsightError("OPTION should be an object");
		}
		return;
	}

	public getData(kind: InsightDatasetKind, courseOrRoomData: any, id: string) {
		let data: any[] = [];
		if (kind === InsightDatasetKind.Sections) {
			courseOrRoomData[id].courses.forEach((eachData: any) => {
				if (eachData["sections"].length > 0) {
					data = data.concat(eachData["sections"]);
				}
			});
		} else {
			courseOrRoomData[id].buildings.forEach((eachData: any) => {
				if (eachData.rooms.length > 0) {
					data = data.concat(eachData.rooms);
				}
			});
		}
		return data;
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		const anyQuery: any = query;
		let courseOrRoomData: any = this.datasets;
		this.validateQuery(anyQuery);
		const idAndType: {id: string; kind: InsightDatasetKind;} = this.findID(anyQuery);
		const id: string = idAndType.id;
		const kind: InsightDatasetKind = idAndType.kind;
		if (!id || id.match(/^\s*$/) || id.search("_") > 0 || id.length === 0) {
			return Promise.reject(new InsightError("Invalid key"));
		}
		let data: any[] = [];
		data = this.getData(kind, courseOrRoomData, id);
		return new Promise<InsightResult[]>((resolve, reject) => {
			try{
				const whereStatement = anyQuery.WHERE;
				let filteredData: any;
				let transformedData: any;
				if (Object.keys(whereStatement).length === 0) {
					filteredData = data;
				} else if (Object.keys(whereStatement).length !== 1) {
					throw new InsightError("WHERE can only have one key");
				} else {
					filteredData = processWhere(whereStatement, data, id, kind);
				}
				if (anyQuery.TRANSFORMATIONS) {
					transformedData = processTransformation(anyQuery.TRANSFORMATIONS,filteredData,id,kind);
				}
				let finalData: InsightResult[];
				const optionStatement = anyQuery.OPTIONS;
				this.validateOptions(optionStatement,);
				finalData = optionController(optionStatement,filteredData,id,transformedData,anyQuery,kind);
				if (optionStatement.ORDER) {
					finalData = orderController(optionStatement,finalData);
				}
				if (finalData.length > 5000) {
					throw new ResultTooLargeError("More than 5000 results");
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

	public clearDatasets() {
		this.datasets = {};
	}
}
