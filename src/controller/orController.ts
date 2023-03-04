import InsightFacade from "./InsightFacade";
import {InsightError} from "./IInsightFacade";
import processWhere from "./processWhere";

function orController(query: any, data: any, id: string): any {
	if (query.length !== 2) {
		throw new InsightError("There should be only two sub-queries for OR");
	}
	const processedDataFirst = processWhere(query[0], data, id);
	let mergedSet = new Set();
	if (processedDataFirst.length > 0) {
		processedDataFirst.forEach((eachData: any) => mergedSet.add(eachData));
	}
	const processedDataSecond = processWhere(query[1], data, id);
	if (processedDataSecond.length > 0) {
		processedDataSecond.forEach((eachData: any) => mergedSet.add(eachData));
	}
	return Array.from(mergedSet);
}
export default orController;
