import InsightFacade from "./InsightFacade";
import {InsightError, InsightResult} from "./IInsightFacade";

function optionController(query: any,data: any,id: string,transformedData: any, anyQuery: any): InsightResult[] {
	const validFields: string[] = ["uuid","id","title","instructor","dept","year","avg","pass","fail","audit"];
	let processedOptionsData: any = {};
	// for (const indices in query.COLUMNS) {
	// 	if (query.COLUMNS[indices].split("_")[0] !== id) {
	// 		throw new InsightError("Invalid ID in COLUMNS");
	// 	}
	// }
	// for (const indices in query.COLUMNS) {
	// 	if (validFields.find((element) => element === query.COLUMNS[indices].split("_")[1]) === undefined) {
	// 		throw new InsightError("Invalid keys in COLUMNS");
	// 	}
	// }
	let result: InsightResult[] = [];
	let numOfColumnKey = query.COLUMNS.length;
	if (transformedData && Array.isArray(query.COLUMNS)) {
		let applyKeys = anyQuery.TRANSFORMATIONS.APPLY.map((eachObject: any) => {
			return Object.keys(eachObject)[0];
		});
		let groupKeys = anyQuery.TRANSFORMATIONS.GROUP;
		Object.keys(transformedData).forEach((eachKey: string) => {
			let extractInfo: InsightResult = {};
			query.COLUMNS.forEach((eachColumn: string) => {
				if (applyKeys.includes(eachColumn)) {
					extractInfo[eachColumn] = transformedData[eachKey][eachColumn];
				} else {
					const field = eachColumn.split("_")[1];
					const value = transformedData[eachKey].DATA[0][field];
					extractInfo[eachColumn] = value;
				}
				console.log("checkpoint");
			});
			result.push(extractInfo);
		});
	} else {
		for (let filteredData of data) {
			let extractInfo: InsightResult = {};
			for(let i = 0; i < numOfColumnKey; i++){
				const field = query.COLUMNS[i].split("_")[1];
				const key = query.COLUMNS[i];
				const value = filteredData[field];
				extractInfo[key] = value;
			}
			result.push(extractInfo);
		}
	}
	console.log("checkpoint");
	return result;
}

export default optionController;
