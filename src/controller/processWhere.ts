import InsightFacade from "./InsightFacade";
import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import gtController from "./gtController";
import ltController from "./ltController";
import isController from "./isController";
import eqController from "./eqController";
import orController from "./orController";
import andController from "./andController";

function processWhere(this: any, whereStatement: any, filteredData: any, id: string, kind: InsightDatasetKind): any {
	let processedData: any = filteredData;
	if (!whereStatement.AND && !whereStatement.OR && !whereStatement.NOT && !whereStatement.GT &&
		!whereStatement.LT && !whereStatement.IS && !whereStatement.EQ) {
		throw new InsightError("Invalid key in where");
	}
	if (whereStatement.AND) {
		processedData = andController(whereStatement.AND, processedData, id, kind);
	}
	if (whereStatement.OR) {
		processedData = orController(whereStatement.OR, processedData, id, kind);
	}
	if (whereStatement.NOT) {
		if (Object.keys(whereStatement.NOT).length !== 1) {
			throw new InsightError("NOT can only have one key");
		}
		let dataToExclude: any;
		dataToExclude = processWhere(whereStatement.NOT, processedData, id, kind);
		processedData = processedData.filter(function(eachData: any) {
			if (dataToExclude.indexOf(eachData) > -1){
				return false;
			} else {
				return true;
			}
		});
	}
	if (whereStatement.GT) {
		processedData = gtController(whereStatement.GT, processedData, id, kind);
	}
	if (whereStatement.LT) {
		processedData = ltController(whereStatement.LT, processedData, id, kind);
	}
	if (whereStatement.IS) {
		processedData = isController(whereStatement.IS,processedData, id, kind);
	}
	if (whereStatement.EQ) {
		processedData = eqController(whereStatement.EQ, processedData, id, kind);
	}
	return processedData;
}
export default processWhere;
