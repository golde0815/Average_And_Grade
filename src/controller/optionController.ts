import InsightFacade from "./InsightFacade";
import {InsightResult} from "./IInsightFacade";

function optionController(query: any, data: any): InsightResult[] {
	console.log("data[0]: ", data[0]);
	console.log("inside column: ", query.COLUMNS);
	console.log("first column element: ", query.COLUMNS[0]);
	let result: InsightResult[] = [];
	let numOfColumnKey = query.COLUMNS.length;
	console.log("in Columns: ", numOfColumnKey);
	for (let filteredData of data) {
		let extractInfo: InsightResult = {};
		for(let i = 0; i < numOfColumnKey; i++){
			const field = query.COLUMNS[i].substring(9);
			console.log("field: ", field);
			const key = query.COLUMNS[i];
			console.log("key: ", key);
			const value = filteredData[field];
			console.log("value: ", value);
			extractInfo[key] = value;
			console.log("extractInfo: ", extractInfo);
		}
		result.push(extractInfo);
	}
	console.log(result);
	return result;
}

export default optionController;
