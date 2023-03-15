import InsightFacade from "./InsightFacade";
import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import processWhere from "./processWhere";

function orController(query: any, data: any, id: string, kind: InsightDatasetKind): any {
	if (query.length === 0) {
		throw new InsightError("There should be only two sub-queries for OR");
	}
	let mergedSet = new Set();
	for (let i in query) {
		const processedData = processWhere(query[i],data,id,kind);
		if (processedData.length > 0) {
			processedData.forEach((eachData: any) => mergedSet.add(eachData));
		}
	}
	// const processedDataFirst = processWhere(query[0], data, id);
	// if (processedDataFirst.length > 0) {
	// 	processedDataFirst.forEach((eachData: any) => mergedSet.add(eachData));
	// }
	// const processedDataSecond = processWhere(query[1], data, id);
	// if (processedDataSecond.length > 0) {
	// 	processedDataSecond.forEach((eachData: any) => mergedSet.add(eachData));
	// }
	return Array.from(mergedSet);
}
export default orController;
