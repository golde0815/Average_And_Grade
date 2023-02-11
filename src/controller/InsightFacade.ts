import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import andController from "./andController";
import isController from "./isController";
import eqController from "./eqController";
import gtController from "./gtController";
import optionController from "./optionController";
import orderController from "./orderController";
import ltController from "./ltController";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockData = require("./data");
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
		return Promise.resolve(["Not implemented."]);
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.resolve("Not implemented.");
	}
	public processWhere(whereStatement: any, filteredData: any) {
		let processedData: any = filteredData;
		console.log("whereStatement: ", whereStatement);
		if (whereStatement.AND) {
			processedData = this.processWhere(whereStatement.AND[0], filteredData);
			processedData = this.processWhere(whereStatement.AND[1], processedData);
		}
		if (whereStatement.OR) {
			processedData = this.processWhere(whereStatement.OR[0], filteredData);
			if (processedData.length === 0) {
				processedData = this.processWhere(whereStatement.OR[1], filteredData);
			}
		}
		if (whereStatement.NOT) {
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
	public performQuery(query: unknown): Promise<InsightResult[]> {
		const anyQuery: any = query;
		if (anyQuery == null) {
			return Promise.reject(new InsightError("Invalid query (null)"));
		}
		if (!anyQuery.WHERE || !anyQuery.OPTIONS) {
			return Promise.reject(new InsightError("No WHERE / OPTION statement in query"));
		}
		const whereStatement = anyQuery.WHERE;
		console.log("Inside WHERE:", anyQuery.WHERE);
		let filteredData;
		filteredData = this.processWhere(whereStatement, mockData);
		let finalData: InsightResult[];
		console.log("filteredData: ", filteredData);
		const optionStatement = anyQuery.OPTIONS;
		finalData = optionController(optionStatement, filteredData);
		finalData = orderController(optionStatement.ORDER,finalData);
		return Promise.resolve(finalData);
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve([]);
	}
}
