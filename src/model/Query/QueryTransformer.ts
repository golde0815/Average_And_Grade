import {InsightResult} from "../../controller/IInsightFacade";
import Decimal from "decimal.js";
import {extractField} from "./QueryValidator";
import {IData} from "../Dataset/IDataset";
import {APPLYRULE, APPLYTOKENFieldPair} from "./Query";

export interface IGroups {
	[groupKey: string]: IData[]
}

export function groupData(filteredResults: IData[], keys: string[]) {
	let results: IGroups = {};
	for (let data of filteredResults) {
		const groupKey = createGroupKey(data, keys);
		if (!results[groupKey]) {
			results[groupKey] = [];
		}
		results[groupKey].push(data);
	}
	return results;
}

function createGroupKey(data: IData, keys: string[]) {
	let groupKey = "";
	keys.forEach((key) => {
		groupKey += data[extractField(key)];
	});
	return groupKey;
}

export function findLocation(section: any, results: any[][], keys: string[]): number {
	// let count = 0;
	for (let result of results) {
		let count = 0;
		for (let key of keys) {
			let realkey = extractField(key);
			if (section[realkey] === result[0][realkey]) {
				count += 1;
			}
		}
		if (count === keys.length) {
			return results.indexOf(result);
		};
	}
	return -1;
}

// second argument should be query[Transform], query[Columns], keys should be query[Transform]
export function applyGroupFunctions(groupedData: IGroups, columns: string[], applyRules: APPLYRULE[]): InsightResult[] {
	let result: InsightResult[] = [];
	for (let dataGroup of Object.values(groupedData)) {
		let insightResult: InsightResult = {};
		for (let column of columns) {
			if (column.includes("_")) {
				insightResult[column] = dataGroup[0][extractField(column)];
			} else {
				// let int = keys.indexOf(column);
				for (let rule of applyRules) {
					const applyKey = Object.keys(rule)[0];
					if (column === applyKey) {
						insightResult[column] = applySingleRule(dataGroup, rule[applyKey]);
					}
				}
				// insightResult[column] = applyrules(element, keys[int]);
			}
		}
		result.push(insightResult);
	}
	return result;
}

interface INumericData {
	[key: string]: number;
}

export function applySingleRule(dataGroup: IData[], tokenFieldPair: APPLYTOKENFieldPair): number {
	// let keyName: string = Object.keys(tokenFieldPair)[0];
	// let field: string = Object.values(tokenFieldPair[keyName])[0] as string;
	// let field = extractField(field);
	let max: number, min: number, sum: number, avg: number;
	let total = new Decimal (0);
	const token = Object.keys(tokenFieldPair)[0];
	const field = extractField(Object.values(tokenFieldPair)[0]);
	if (!dataGroup.length) {
		return -1;
	}
	if (token === "COUNT") {
		const distinctItems = new Set(dataGroup.map((data) => data[field]));
		return distinctItems.size;
	}

	const numericDataGroup = dataGroup as INumericData[];
	switch (token) {
		case "MAX":
			max = numericDataGroup[0][field];
			numericDataGroup.forEach((data) => {
				if (data[field] > max) {
					max = data[field];
				}
			});
			return max;
		case "MIN":
			min = numericDataGroup[0][field];
			numericDataGroup.forEach((data) => {
				if (data[field] < min) {
					min = data[field];
				}
			});
			return min;
		case "AVG":
			numericDataGroup.forEach((data) => {
				let value = new Decimal(data[field]);
				total = total.add(value);
			});
			avg = total.toNumber() / dataGroup.length;
			return Number(avg.toFixed(2));
		case "SUM":
			sum = 0;
			numericDataGroup.forEach((data) => {
				sum += data[field] as number;
			});
			return Number(sum.toFixed(2));
		default:
			return -1;
	}
}
