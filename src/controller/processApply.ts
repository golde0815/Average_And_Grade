import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import Decimal from "decimal.js";
function validateApply (value: string, id: string, kind: InsightDatasetKind, eachQuery: any, valueObject: any) {
	const validNCourseFields: string[] = ["year","avg","pass","fail","audit"];
	const validCourseFields: string[] = ["uuid","id","title","instructor","dept","year","avg","pass","fail","audit"];
	const validNRoomFields: string[] = ["lat", "lon", "seats"];
	const validRoomFields: string[] = ["shortname", "fullname", "number", "name", "address", "lat", "lon", "seats",
		"type", "furniture", "href"];
	if (typeof value !== "string") {
		throw new InsightError("Invalid apply rule");
	}
	if (value.split("_")[0] !== id) {
		throw new InsightError("Invalid ID in APPLY");
	}
	if (Object.keys(valueObject).length !== 1) {
		throw new InsightError("Too many keys in apply");
	}

	if (kind === InsightDatasetKind.Sections) {
		if (valueObject.AVG || valueObject.MAX || valueObject.MIN || valueObject.SUM) {
			if (validNCourseFields.find((element) => element === value.split("_")[1]) === undefined) {
				throw new InsightError("Invalid field in APPLY (should have number sections field)");
			}
		} else if (valueObject.COUNT) {
			if (validCourseFields.find((element) => element === value.split("_")[1]) === undefined) {
				throw new InsightError("Invalid field in APPLY (should have sections field)");
			}
		} else {
			throw new InsightError("Invalid key to aggregate");
		}
	} else {
		if (valueObject.AVG || valueObject.MAX || valueObject.MIN || valueObject.SUM) {
			if (validNRoomFields.find((element) => element === value.split("_")[1]) === undefined) {
				throw new InsightError("Invalid keys in APPLY (should have rooms field)");
			}
		} else if (valueObject.COUNT) {
			if (validRoomFields.find((element) => element === value.split("_")[1]) === undefined) {
				throw new InsightError("Invalid keys in APPLY (should have rooms field)");
			}
		} else {
			throw new InsightError("Invalid key to aggregate");
		}
	}
	return;
}
function computeAverage (key: string, eachGroupKey: string, groupedData: any, avgKey: string): number {
	let value = groupedData[eachGroupKey].DATA;
	let total = new Decimal(0);
	for (let v of value) {
		let sum = new Decimal(v[avgKey]);
		total = total.add(sum);
	}
	let average = total.toNumber() / value.length;
	return Number(average.toFixed(2));
}
function computeSum (key: string, eachGroupKey: string, groupedData: any, sumKey: string): number {
	let value = groupedData[eachGroupKey].DATA;
	let sum = 0;
	for (let v of value) {
		sum += v[sumKey];
	}
	return Number(sum.toFixed(2));
}
function computeMax (key: string, eachGroupKey: string, groupedData: any, maxKey: string): number {
	let value = groupedData[eachGroupKey].DATA;
	let max = Number.MIN_SAFE_INTEGER;
	for (let v of value) {
		if (max < v[maxKey]) {
			max = v[maxKey];
		}
	}
	return max;
}
function computeMin (key: string, eachGroupKey: string, groupedData: any, minKey: string): number {
	let value = groupedData[eachGroupKey].DATA;
	let min = Number.MAX_SAFE_INTEGER;
	for (let v of value) {
		if (min > v[minKey]) {
			min = v[minKey];
		}
	}
	return min;
}

function computeCount (key: string, eachGroupKey: string, groupedData: any, eachQuery: any,
					   eachQueryKey: string): number {
	let value = groupedData[eachGroupKey].DATA;
	let countKey = eachQuery[eachQueryKey].COUNT.split("_")[1];
	let countSet = new Set();
	for (let v of value) {
		countSet.add(v[countKey]);
	}
	return countSet.size;
}

function hasDuplication(query: any) {
	let applySet = new Set();
	// if (typeof query !== Array)
	for (let i in query) {
		if (typeof query[i] !== "object") {
			throw new InsightError("Invalid type");
		}
		applySet.add(Object.keys(query[i])[0]);
	}
	if (applySet.size !== query.length) {
		throw new InsightError("Duplication in apply");
	}
	return;
}
function processApply (query: any, groupedData: any, id: string, kind: InsightDatasetKind): any {
	hasDuplication(query);
	for (let eachQuery of query) {
		let key = Object.keys(eachQuery)[0];
		let valueObject = eachQuery[key];
		if (valueObject.AVG) {
			validateApply(valueObject.AVG, id, kind, eachQuery, valueObject);
			Object.keys(eachQuery).forEach((eachQueryKey: string) => {
				let avgKey = eachQuery[eachQueryKey].AVG.split("_")[1];
				Object.keys(groupedData).forEach((eachGroupKey: string) => {
					groupedData[eachGroupKey][key] = computeAverage(key, eachGroupKey, groupedData, avgKey);
				});
			});
		} else if (valueObject.SUM) {
			validateApply(valueObject.SUM, id, kind, eachQuery, valueObject);
			Object.keys(eachQuery).forEach((eachQueryKey: string) => {
				let sumKey = eachQuery[eachQueryKey].SUM.split("_")[1];
				Object.keys(groupedData).forEach((eachGroupKey: string) => {
					groupedData[eachGroupKey][key] = computeSum(key, eachGroupKey, groupedData, sumKey);
				});
			});
		} else if (valueObject.MAX) {
			validateApply(valueObject.MAX, id, kind, eachQuery, valueObject);
			Object.keys(eachQuery).forEach((eachQueryKey: string) => {
				let maxKey = eachQuery[eachQueryKey].MAX.split("_")[1];
				Object.keys(groupedData).forEach((eachGroupKey: string) => {
					groupedData[eachGroupKey][key] = computeMax(key,eachGroupKey,groupedData,maxKey);
				});
			});
		} else if (valueObject.MIN) {
			validateApply(valueObject.MIN, id, kind, eachQuery, valueObject);
			Object.keys(eachQuery).forEach((eachQueryKey: string) => {
				let minKey = eachQuery[eachQueryKey].MIN.split("_")[1];
				Object.keys(groupedData).forEach((eachGroupKey: string) => {
					groupedData[eachGroupKey][key] = computeMin(key,eachGroupKey,groupedData,minKey);
				});
			});
		} else if (valueObject.COUNT) {
			validateApply(valueObject.COUNT, id, kind, eachQuery, valueObject);
			Object.keys(eachQuery).forEach((eachQueryKey: string) => {
				Object.keys(groupedData).forEach((eachGroupKey: string) => {
					groupedData[eachGroupKey][key] = computeCount(key,eachGroupKey,groupedData,eachQuery,eachQueryKey);
				});
			});
		} else {
			throw new InsightError("Invalid apply");
		}
	}
	return groupedData;
}

export default processApply;
