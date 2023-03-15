import InsightFacade from "./InsightFacade";
import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import processApply from "./processApply";
function validateGroup(query: any, id: string, kind: InsightDatasetKind) {
	const validCourseFields: string[] = ["uuid","id","title","instructor","dept","year","avg","pass","fail","audit"];
	const validRoomFields: string[] = ["shortname", "fullname", "number", "name", "address", "lat", "lon", "seats",
		"type", "furniture", "href"];
	for (const indices in query.GROUP) {
		if (query.GROUP[indices].split("_")[0] !== id) {
			throw new InsightError("Invalid ID in GROUP");
		}
	}
	for (const indices in query.GROUP) {
		if (kind === InsightDatasetKind.Sections) {
			if (validCourseFields.find((element) => element === query.GROUP[indices].split("_")[1]) === undefined) {
				throw new InsightError("Invalid field in GROUP (should have sections field)");
			}
		} else {
			if (validRoomFields.find((element) => element === query.GROUP[indices].split("_")[1]) === undefined) {
				throw new InsightError("Invalid keys in GROUP (should have rooms field)");
			}
		}
	}
}
function processTransformation(query: any, filteredData: any, id: string, kind: InsightDatasetKind): any {
	if (!query.GROUP || !query.APPLY) {
		throw new InsightError("No group and apply in transformations");
	}
	if (Object.keys(query).length !== 2) {
		throw new InsightError("There should only be Group and apply key");
	}
	let groupedData: any = {};
	validateGroup(query, id, kind);
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
	groupedData = processApply(query.APPLY,groupedData,id,kind);
	return groupedData;
}

export default processTransformation;
