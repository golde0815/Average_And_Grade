import InsightFacade from "./InsightFacade";
import {InsightError} from "./IInsightFacade";
import processApply from "./processApply";
function validateGroup(query: any, id: string) {
	const validFields: string[] = ["uuid","id","title","instructor","dept","year","avg","pass","fail","audit"];
	for (const indices in query.GROUP) {
		if (query.GROUP[indices].split("_")[0] !== id) {
			throw new InsightError("Invalid ID in GROUP");
		}
	}
	for (const indices in query.GROUP) {
		if (validFields.find((element) => element === query.GROUP[indices].split("_")[1]) === undefined) {
			throw new InsightError("Invalid keys in GROUP");
		}
	}
}
function processTransformation(query: any, filteredData: any, id: string): any {
	if (!query.GROUP || !query.APPLY) {
		throw new InsightError("No group and apply in transformations");
	}
	if (Object.keys(query).length !== 2) {
		throw new InsightError("There should only be Group and apply key");
	}
	let groupedData: any = {};
	validateGroup(query, id);
	for (let eachData of filteredData) {
		let combinedKey: string = "";
		combinedKey = query.GROUP.map((eachKey: any) => {
			eachKey = eachKey.split("_")[1];
			if (eachData[eachKey]) {
				return eachData[eachKey];
			} else {
				return "";
			}
		}).filter((value: string) => value).join("_");
		if (groupedData[combinedKey]) {
			groupedData[combinedKey].DATA.push(eachData);
		} else {
			groupedData[combinedKey] = {};
			groupedData[combinedKey]["DATA"] = [eachData];
		}
	}
	groupedData = processApply(query.APPLY,groupedData,id);
	return groupedData;
}

export default processTransformation;
