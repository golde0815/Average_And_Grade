import {InsightError} from "./IInsightFacade";
import Decimal from "decimal.js";
function validateApply (value: string, id: string) {
	const validFields: string[] = ["uuid","id","title","instructor","dept","year","avg","pass","fail","audit"];
	if (value.split("_")[0] !== id) {
		throw new InsightError("Invalid ID in APPLY");
	}
	if (validFields.find((element) => element === value.split("_")[1]) === undefined) {
		throw new InsightError("Invalid keys in APPLY");
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

function hasDuplication(query: any) {
	let applySet = new Set();
	for (let i in query) {
		applySet.add(Object.keys(query[i])[0]);
	}
	if (applySet.size !== query.length) {
		throw new InsightError("Duplication in apply");
	}
	return;
}
function processApply (query: any, groupedData: any, id: string): any {
	hasDuplication(query);
	for (let eachQuery of query) {
		let key = Object.keys(eachQuery)[0];
		let valueObject = eachQuery[key];
		if (valueObject.AVG) {
			validateApply(valueObject.AVG, id);
			Object.keys(eachQuery).forEach((eachQueryKey: string) => {
				let avgKey = eachQuery[eachQueryKey].AVG.split("_")[1];
				Object.keys(groupedData).forEach((eachGroupKey: string) => {
					groupedData[eachGroupKey][key] = computeAverage(key, eachGroupKey, groupedData, avgKey);
				});
			});
		} else if (valueObject.SUM) {
			validateApply(valueObject.SUM, id);
			Object.keys(eachQuery).forEach((eachQueryKey: string) => {
				let sumKey = eachQuery[eachQueryKey].SUM.split("_")[1];
				Object.keys(groupedData).forEach((eachGroupKey: string) => {
					groupedData[eachGroupKey][key] = computeSum(key, eachGroupKey, groupedData, sumKey);
				});
			});
		} else if (valueObject.MAX) {
			validateApply(valueObject.MAX, id);
			Object.keys(eachQuery).forEach((eachQueryKey: string) => {
				let maxKey = eachQuery[eachQueryKey].MAX.split("_")[1];
				Object.keys(groupedData).forEach((eachGroupKey: string) => {
					groupedData[eachGroupKey][key] = computeMax(key,eachGroupKey,groupedData,maxKey);
				});
			});
		} else if (valueObject.MIN) {
			validateApply(valueObject.MIN, id);
			Object.keys(eachQuery).forEach((eachQueryKey: string) => {
				let minKey = eachQuery[eachQueryKey].MIN.split("_")[1];
				Object.keys(groupedData).forEach((eachGroupKey: string) => {
					groupedData[eachGroupKey][key] = computeMin(key,eachGroupKey,groupedData,minKey);
				});
			});
		} else if (valueObject.COUNT) {
			validateApply(valueObject.COUNT, id);
			Object.keys(eachQuery).forEach((eachQueryKey: string) => {
				Object.keys(groupedData).forEach((eachGroupKey: string) => {
					groupedData[eachGroupKey][key] = groupedData[eachGroupKey].DATA.length;
				});
			});
		} else {
			throw new InsightError("Invalid apply");
		}
	}
	return groupedData;
}

export default processApply;
