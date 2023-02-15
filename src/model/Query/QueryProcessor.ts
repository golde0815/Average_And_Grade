import {Section, SectionFieldType} from "../Dataset/CourseDataset/Section";
import {InsightResult} from "../../controller/IInsightFacade";
import {DIRECTION, FILTER, KeyValuePair, OPTIONS, TRANSFORMATION} from "./Query";
import {extractField} from "./QueryValidator";
import {applyGroupFunctions, groupData, IGroups} from "./QueryTransformer";
import {IData, IDataset} from "../Dataset/IDataset";
import {Room, RoomFieldType} from "../Dataset/RoomDataset/Room";


export function processFILTER(filter: any, dataset: IDataset): IData[]{
	const child = Object.keys(filter)[0];
	switch (child) {
		case "AND":
			return processAND(filter[child] as FILTER[], dataset);
		case "OR":
			return processOR(filter[child] as FILTER[], dataset);
		case "NOT":
			return processNOT(filter[child] as FILTER, dataset);
		case "IS":
			return processSCOMP(filter[child] as KeyValuePair, dataset);
		case "LT":
		case "GT":
		case "EQ":
			return processMComp(filter[child] as KeyValuePair, dataset, child);
		default:
			return [];
	}
}

export function processSCOMP(key: KeyValuePair, dataset: IDataset): IData[] {
	let field: string = extractField(key);
	let dataList: IData[] = [];
	let value: string = String(Object.values(key)[0]);
	dataset.dataList.forEach((data) => {
		if (value.startsWith("*") && value.endsWith("*") && value.length >= 2) {
			let substring: string = value.substring(1, value.length - 1);
			if (String(data[field]).includes(substring)) {
				dataList.push(data);
			}
		} else if (value.startsWith("*")) {
			let substring: string = value.substring(1);
			if (String(data[field]).endsWith(substring)) {
				dataList.push(data);
			}
		} else if (value.endsWith("*")) {
			let substring: string = value.substring(0, value.length - 1);
			if (String(data[field]).startsWith(substring)) {
				dataList.push(data);
			}
		} else if (data[field] === value) {
			dataList.push(data);
		}
	});
	return dataList;
}

export function processMComp(key: KeyValuePair, dataset: IDataset, operator: "LT" | "GT" | "EQ" ): IData[] {
	let field: string = extractField(key);
	let dataList: IData[] = [];
	dataset.dataList.forEach((data) => {
		switch (operator) {
			case "LT":
				if (data[field] < Object.values(key)[0]) {
					dataList.push(data);
				}
				break;
			case "GT":
				if (data[field] > Object.values(key)[0]) {
					dataList.push(data);
				}
				break;
			case "EQ":
				if (data[field] === Object.values(key)[0]) {
					dataList.push(data);
				}
				break;
		}
	});
	return dataList;
}

export function processNOT(notQuery: FILTER, dataset: IDataset): IData[] {
	let results: IData[] = [];
	let temp = processFILTER(notQuery, dataset);
	dataset.dataList.forEach((data) => results.push(data));
	results = results.filter((data) => !temp.includes(data));
	return results;
}

export function processOR(orQuery: FILTER[], dataset: IDataset): IData[] {
	let results: IData[] = [];
	orQuery.forEach((filter) => {
		let temp = processFILTER(filter, dataset);
		results = [...new Set([...results, ...temp])];
	});
	return results;
}

export function processAND(andQuery: FILTER[], dataset: IDataset): IData[] {
	let results: IData[] = [];
	let temp: IData[];
	andQuery.forEach((filter, index) => {
		temp = processFILTER(filter, dataset);
		if (index === 0) {
			results = temp;
		} else {
			results = results.filter((data) => temp.includes(data));
		}
	});
	return results;
}

export function processOptions(options: OPTIONS, dataList: IData[]): InsightResult[] {
	let results: InsightResult[] = processCOLUMNS(options.COLUMNS, dataList);
	results = processORDER(results, options.ORDER);
	return results;
}

export function processOptionsWithTransformation(
	option: OPTIONS,
	transformation: TRANSFORMATION,
	dataList: IData[]
): InsightResult[] {
	let result: InsightResult[] = [];
	let groupedData: IGroups = groupData(dataList, transformation.GROUP);
	result = applyGroupFunctions(groupedData, option.COLUMNS, transformation.APPLY);
	result = processORDER(result, option.ORDER);
	return result;
}

export function processCOLUMNS(columns: string[], dataList: IData[]): InsightResult[] {
	let results: InsightResult[] = [];
	let field: string;
	dataList.forEach((data) => {
		let result: InsightResult = {} as InsightResult;
		columns.forEach((key) => {
			field = extractField(key);
			result[key] = data[field];
		});
		results.push(result);
	});
	return results;
}

// export function processORDER(results: InsightResult[], order?: string) {
// 	if (order) {
// 		const field = extractField(order);
// 		if (Section.fieldName[field as FieldT][1] === "s") {
// 			results.sort((a, b) => {
// 				return (a[order] as string) < (b[order] as string) ? -1 : 1;
// 			});
// 		} else {
// 			results.sort((a, b) => Number(a[order]) - Number(b[order]));
// 		}
// 	}
// 	return results;
// }

export function processORDER(results: InsightResult[], order?: string | any) {
	if (order) {
		if (typeof order === "string") {
			const field = extractField(order);
			// TODO: cleanup
			if ((Section.fieldNameAndType[field as SectionFieldType]
			&& Section.fieldNameAndType[field as SectionFieldType][1] === "s")
			|| Room.fieldType[field as RoomFieldType] === "s") {
				results.sort((a, b) => {
					return (a[order] as string) < (b[order] as string) ? -1 : 1;
				});
			} else {
				results.sort((a, b) => Number(a[order]) - Number(b[order]));
			}
		} else {
			if (order["keys"]) {
				results.sort((a, b) => {
					for (let key of order["keys"]) {
						let dir = order["dir"] === "DOWN" ? -1 : 1;
						if (a[key] > b[key]) {
							return dir;
						} else if (a[key] < b[key]) {
							return dir * -1;
						}
					}
					return 0;
				});
			}
		}
	}
	return results;
}
