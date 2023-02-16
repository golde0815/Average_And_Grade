import InsightFacade from "./InsightFacade";
import {InsightError, InsightResult} from "./IInsightFacade";

function optionController(query: any, data: any, id: string): InsightResult[] {
	const validFields: string[] = ["uuid","id","title","instructor","dept","year","avg","pass","fail","audit"];

	for (const indices in query.COLUMNS) {
		if (query.COLUMNS[indices].split("_")[0] !== id) {
			throw new InsightError("Invalid ID in COLUMNS");
		}
	}
	for (const indices in query.COLUMNS) {
		if (validFields.find((element) => element === query.COLUMNS[indices].split("_")[1]) === undefined) {
			throw new InsightError("Invalid keys in COLUMNS");
		}
	}
	let result: InsightResult[] = [];
	let numOfColumnKey = query.COLUMNS.length;
	// console.log("in Columns: ", numOfColumnKey);
	for (let filteredData of data) {
		let extractInfo: InsightResult = {};
		for(let i = 0; i < numOfColumnKey; i++){
			const field = query.COLUMNS[i].split("_")[1];
			// console.log("field: ", field);
			const key = query.COLUMNS[i];
			// console.log("key: ", key);
			const value = filteredData[field];
			// console.log("value: ", value);
			extractInfo[key] = value;
			// console.log("extractInfo: ", extractInfo);
		}
		result.push(extractInfo);
	}
	return result;
}

export default optionController;
