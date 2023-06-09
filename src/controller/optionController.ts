import InsightFacade from "./InsightFacade";
import {InsightDatasetKind, InsightError, InsightResult} from "./IInsightFacade";
function inTransformation (query: any, anyQuery: any) {
	let applyKeys: string[] = [];
	for (const j in anyQuery.TRANSFORMATIONS.APPLY) {
		applyKeys.push(Object.keys(anyQuery.TRANSFORMATIONS.APPLY[j])[0]);
	}
	for (const i in query.COLUMNS) {
		if (!anyQuery.TRANSFORMATIONS.GROUP.includes(query.COLUMNS[i]) && !applyKeys.includes(query.COLUMNS[i])) {
			throw new InsightError("every element in column should be in group or apply");
		}
	}
}
function validateOption(query: any, anyQuery: any, id: string, kind: InsightDatasetKind) {
	const validCourseFields: string[] = ["uuid","id","title","instructor","dept","year","avg","pass","fail","audit"];
	const validRoomFields: string[] = ["shortname", "fullname", "number", "name", "address", "lat", "lon", "seats",
		"type", "furniture", "href"];
	if (anyQuery.TRANSFORMATIONS) {
		let applyKeys = [];
		for (let eachKey of anyQuery.TRANSFORMATIONS.APPLY) {
			applyKeys.push(Object.keys(eachKey)[0]);
		}
		inTransformation(query, anyQuery);
		for (const indices in query.COLUMNS) {
			let queryId = query.COLUMNS[indices].split("_")[0];
			if (queryId !== id && !applyKeys.includes(query.COLUMNS[indices])) {
				throw new InsightError("Invalid ID in columns");
			}
		}
		for (const indices in query.COLUMNS) {
			let queryKey = query.COLUMNS[indices].split("_")[1];
			let boolApply = !applyKeys.includes(query.COLUMNS[indices]);
			if (kind === InsightDatasetKind.Sections) {
				if (validCourseFields.find((element) => element === queryKey) === undefined && boolApply) {
					throw new InsightError("Invalid field in COLUMN (should have sections field)");
				}
			} else {
				if (validRoomFields.find((element) => element === queryKey) === undefined && boolApply) {
					throw new InsightError("Invalid keys in COLUMN (should have rooms field)");
				}
			}
		}
	} else {
		for (const indices in query.COLUMNS) {
			if (query.COLUMNS[indices].split("_")[0] !== id) {
				throw new InsightError("Invalid ID in COLUMNS");
			}
		}
		for (const indices in query.COLUMNS) {
			let queryKey = query.COLUMNS[indices].split("_")[1];
			if (kind === InsightDatasetKind.Sections) {
				if (validCourseFields.find((element) => element === queryKey) === undefined) {
					throw new InsightError("Invalid field in COLUMN (should have sections field)");
				}
			} else {
				if (validRoomFields.find((element) => element === queryKey) === undefined) {
					throw new InsightError("Invalid keys in COLUMN (should have rooms field)");
				}
			}
		}
	}
	return;
}
function optionController(query: any,data: any,id: string,transformedData: any, anyQuery: any,
						  kind: InsightDatasetKind): InsightResult[] {
	validateOption(query, anyQuery, id, kind);
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
	return result;
}

export default optionController;
