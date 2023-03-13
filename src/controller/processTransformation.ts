import InsightFacade from "./InsightFacade";
import {InsightError} from "./IInsightFacade";
import processApply from "./processApply";

function processTransformation(query: any, filteredData: any, id: string): any {
	if (!query.GROUP || !query.APPLY) {
		throw new InsightError("No group and apply in transformations");
	}
	let groupedData: any = {};
	// TODO: check id
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
