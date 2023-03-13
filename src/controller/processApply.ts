import {InsightError} from "./IInsightFacade";

function processApply (query: any, groupedData: any, id: string): any {

	for (let eachQuery of query) {
		let key = Object.keys(eachQuery)[0];
		let valueObject = eachQuery[key];
		if (valueObject.AVG) {
			Object.keys(eachQuery).forEach((eachQueryKey: string) => {
				let avgKey = eachQuery[eachQueryKey].AVG.split("_")[1];
				Object.keys(groupedData).forEach((eachGroupKey: string) => {
					let value = groupedData[eachGroupKey].DATA;
					let sum = 0;
					for (let v of value) {
						sum += v[avgKey];
					}
					let average = sum / value.length;
					groupedData[eachGroupKey][key] = average;
				});
			});
		} else if (valueObject.SUM) {
			Object.keys(eachQuery).forEach((eachQueryKey: string) => {
				let sumKey = eachQuery[eachQueryKey].SUM.split("_")[1];
				Object.keys(groupedData).forEach((eachGroupKey: string) => {
					let value = groupedData[eachGroupKey].DATA;
					let sum = 0;
					for (let v of value) {
						sum += v[sumKey];
					}
					groupedData[eachGroupKey][key] = sum;
				});
			});
		} else if (valueObject.MAX) {
			Object.keys(eachQuery).forEach((eachQueryKey: string) => {
				let maxKey = eachQuery[eachQueryKey].MAX.split("_")[1];
				Object.keys(groupedData).forEach((eachGroupKey: string) => {
					let value = groupedData[eachGroupKey].DATA;
					let max = Number.MIN_SAFE_INTEGER;
					for (let v of value) {
						if (max < v[maxKey]) {
							max = v[maxKey];
						}
					}
					groupedData[eachGroupKey][key] = max;
				});
			});
		} else if (valueObject.MIN) {
			Object.keys(eachQuery).forEach((eachQueryKey: string) => {
				let minKey = eachQuery[eachQueryKey].MIN.split("_")[1];
				Object.keys(groupedData).forEach((eachGroupKey: string) => {
					let value = groupedData[eachGroupKey].DATA;
					let min = Number.MAX_SAFE_INTEGER;
					for (let v of value) {
						if (min > minKey) {
							min = v[minKey];
						}
					}
					groupedData[eachGroupKey][key] = min;
				});
			});
		} else if (valueObject.COUNT) {
			Object.keys(eachQuery).forEach((eachQueryKey: string) => {
				Object.keys(groupedData).forEach((eachGroupKey: string) => {
					let value = groupedData[eachGroupKey].DATA;
					groupedData[eachGroupKey][key] = value.length;
				});
			});
		} else {
			throw new InsightError("Invalid apply");
		}
	}
	return groupedData;
}

export default processApply;
