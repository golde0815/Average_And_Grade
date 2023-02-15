import {Section, SectionFieldType} from "../Dataset/CourseDataset/Section";
import {FILTER, IQuery, KeyValuePair, LOGICCOMPARISON} from "./Query";
import {Room, RoomFieldType} from "../Dataset/RoomDataset/Room";
import {InsightDatasetKind} from "../../controller/IInsightFacade";

let transformkeys: string[] = [];

export function getDatasetId(json: any): string | false {
	const key: string = getTargetKeyField(json);
	const keyParts = key.split("_");
	if (keyParts.length === 2) {
		return keyParts[0];
	}
	return false;
}

export function getDatasetKind(json: any): InsightDatasetKind | false {
	const key: string = getTargetKeyField(json);
	const keyParts = key.split("_");
	if (keyParts.length === 2) {
		if (keyParts[1] in Room.fieldType) {
			return InsightDatasetKind.Rooms;
		} else if (keyParts[1] in Section.fieldNameAndType) {
			return InsightDatasetKind.Sections;
		}
	}
	return false;
}

function getTargetKeyField(json: any): string {
	if ("OPTIONS" in json) {
		if ("TRANSFORMATIONS" in json) {
			if ("GROUP" in json.TRANSFORMATIONS) {
				const group = json.TRANSFORMATIONS.GROUP;
				if (Array.isArray(group) && group.length) {
					return group[0];
				}
			}
		} else if ("COLUMNS" in json.OPTIONS) {
			const columns = json.OPTIONS.COLUMNS;
			if ( Array.isArray(columns) && columns.length) {
				return columns[0];
			}
		}
	}
	return "";
}

export function validateQuery(
	json: any, targetDatasetId: string, targetDatasetType: InsightDatasetKind
): string | true {
	try {
		const queryString: string  = JSON.stringify(json);
		JSON.parse(queryString);
	} catch (err) {
		return "Invalid query format";
	}
	if (!("WHERE" in json && "OPTIONS" in json)) {
		return "Missing Where|Options clause";
	}
	if (!("TRANSFORMATIONS" in json) && Object.keys(json).length > 2) {
		return "Extra parameters other than Where and Options provided which was not Transformation";
	}
	if (Object.keys(json).length > 3) {
		return "Extra parameters other than Where, Options and Transformation provided";
	}
	const query = json as IQuery;
	if (!checkOptions(query.OPTIONS, targetDatasetId, targetDatasetType)) {
		return "Invalid OPTIONS";
	}
	if (Object.keys(query.WHERE).length && !isFilter(query.WHERE, targetDatasetId, targetDatasetType)) {
		return "Invalid WHERE";
	}
	if ("TRANSFORMATIONS" in json) {
		if (!checkTransformations(query.TRANSFORMATIONS, query.OPTIONS.COLUMNS, targetDatasetId, targetDatasetType)) {
			return  "Invalid Transformations";
		}
	}
	return true;
}

export function checkTransformations(transforms: any, columns: any[], targetDatasetID: string,
									 targetDatasetType: InsightDatasetKind): boolean {
	transformkeys = [];
	if (!(Object.keys(transforms).length === 2 &&  "GROUP" in transforms
		&& Array.isArray(transforms.GROUP) && "APPLY" in transforms  && Array.isArray(transforms.APPLY))) {
		return false;
	}
	if (!(transforms.APPLY && transforms.GROUP)) {
		return false;
	}
	for (let groupkey of transforms.GROUP) {
		if (typeof groupkey !== "string") {
			return false;
		}
		if (!groupkey.includes("_")) {
			return false;
		}
		transformkeys.push(groupkey);
	}
	if (!checkApply(transforms.APPLY, columns, targetDatasetID, targetDatasetType)) {
		return false;
	}
	// (Array.from(new Set(transformkeys)).length === Array.from(new Set(columns)).length &&
	if (!Array.from(new Set(columns)).every((element) => {
		return new Set(transformkeys).has(element);
	})) {
		return false;
	}
	return true;
}

export function checkApply(apply: any, columns: string[], targetDatasetId: string,
						   targetDatasetType: InsightDatasetKind): boolean {

	let duplicate = new Set();
	if (new Set(Object.keys(apply)).size !== Object.keys(apply).length) {
		return false;
	}
	for (let applykey of apply) {
		duplicate.add(Object.keys(applykey)[0]);
		if (Object.keys(applykey).length !== 1) {
			return false;
		}
		let key = Object.keys(applykey)[0];
		transformkeys.push(key);
		if (key.includes("_")) {
			return false;
		}
		if (!columns.includes(key)) {
			return false;
		}
		if (Object.keys(applykey[key]).length !== 1) {
			return false;
		}
		let keyValuePair = applykey[key];
		let token = Object.keys(keyValuePair)[0];
		if (!(typeof keyValuePair[token] === "string")){
			return false;
		}
		if (token === "MAX" || token === "MIN" || token === "AVG" || token === "SUM") {
			let applyRow: string = keyValuePair[token] as string;
			if (!isValidQueryKey(applyRow, targetDatasetId, targetDatasetType, "n")) {
				return false;
			}
		} else if (token === "COUNT") {
			let applyRow: string = keyValuePair[token] as string;
			if (!isValidQueryKey(applyRow, targetDatasetId, targetDatasetType)) {
				return false;
			}
		} else {
			return false;
		}
	}
	if (duplicate.size !== apply.length) {
		return false;
	}
	return true;
}

export function checkOptions(options: any, targetDatasetId: string, targetDatasetType: InsightDatasetKind): boolean {
	if (!(options && typeof options === "object" && Object.keys(options).length <= 2
		&& "COLUMNS" in options && Array.isArray(options.COLUMNS) && options.COLUMNS.length)) {
		return false;
	}
	if (options.ORDER) {
		if (typeof options.ORDER === "string") {
			if (options.ORDER && !options.COLUMNS.includes(options.ORDER)) {
				return false;
			}
		} else if (typeof options.ORDER === "object") {
			const order: any = options.ORDER;
			if (!(Object.keys(order).length === 2 && "dir" in order && "keys" in order
				&& order["keys"] && (order["dir"] === "UP" || order["dir"] === "DOWN"))) {
				return false;
			}
			if (order["keys"].length === 0) {
				return false;
			}
			for (let key of order["keys"]) {
				if (!options.COLUMNS.includes(key)) {
					return false;
				}
			}
		} else {
			return false;
		}
	}
	for (let col of options.COLUMNS) {
		if (col.includes("_")) {
			if (!isValidQueryKey(col, targetDatasetId, targetDatasetType)) {
				return false;
			}
		}
	}
	return true;
}

const isFilter = (filter: any, targetDatasetId: string, targetDatasetType: InsightDatasetKind): filter is FILTER => {
	if (!(filter && typeof filter === "object" && Object.keys(filter).length === 1)) {
		return false;
	}
	const operator = Object.keys(filter)[0];
	switch (operator) {
		case "AND":
		case "OR":
			return isLogicComparison(filter[operator], targetDatasetId, targetDatasetType);
		case "NOT":
			return isFilter(filter[operator], targetDatasetId, targetDatasetType);
		case "IS":
			return isValidKeyValuePair(filter[operator], targetDatasetId, targetDatasetType, "s");
		case "LT":
		case "GT":
		case "EQ":
			return isValidKeyValuePair(filter[operator], targetDatasetId, targetDatasetType, "n");
		default:
			return false;
	}
};

const isLogicComparison = (
	logic: any, targetDatasetId: string, targetDatasetType: InsightDatasetKind
): logic is LOGICCOMPARISON => {
	if (!(logic && Array.isArray(logic) && logic.length >= 1)) {
		return false;
	}
	for (let filter of logic) {
		if (!isFilter(filter, targetDatasetId, targetDatasetType)) {
			return false;
		}
	}
	return true;
};

export function isValidKeyValuePair(pair: any, targetDatasetId: string, targetDatasetType: InsightDatasetKind,
	expectedFieldType?: "s" | "n") {
	const keys = Object.keys(pair);
	if (!(pair && typeof pair === "object" && keys.length === 1)) {
		return false;
	}
	if (!isValidQueryKey(keys[0], targetDatasetId, targetDatasetType, expectedFieldType)) {
		return false;
	}
	const value = pair[keys[0]];
	if (expectedFieldType === "s") {
		return typeof value === "string" && checkWildCard(value);
	} else if (expectedFieldType === "n") {
		return typeof value === "number";
	}
	return false;
}

export function checkWildCard(value: string): boolean {
	return !/.+\*.+/.test(value);
}

export function isValidQueryKey(key: string, targetID: string, targetKind: InsightDatasetKind,
	expectedFieldType?: "s" | "n"): boolean {
	const keyParts = key.split("_");
	if (keyParts.length === 2 && keyParts[0].length && keyParts[1].length) {
		if (keyParts[0] === targetID) {
			switch (targetKind) {
				case InsightDatasetKind.Sections:
					if (keyParts[1] in Section.fieldNameAndType) {
						if (expectedFieldType &&
							Section.fieldNameAndType[keyParts[1] as SectionFieldType][1] !== expectedFieldType) {
							return false;
						}
						return true;
					}
					break;
				case InsightDatasetKind.Rooms:
					if (keyParts[1] in Room.fieldType) {
						if (expectedFieldType && Room.fieldType[keyParts[1] as RoomFieldType] !== expectedFieldType) {
							return false;
						}
						return true;
					}
					break;
				default:
					return false;
			}
		}
	}
	return false;
}

export function extractField (key: KeyValuePair | string){
	if (typeof key !== "string") {
		key = Object.keys(key)[0];
	}
	if (!key.includes("_")) {
		return key;
	}
	const split = key.split("_");
	return split.length === 2 ? split[1] : "";
}
