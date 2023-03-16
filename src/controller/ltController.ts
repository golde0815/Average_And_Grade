import InsightFacade from "./InsightFacade";
import {InsightDatasetKind, InsightError} from "./IInsightFacade";

function ltController(query: any, data: any, id: string, kind: InsightDatasetKind): any {
	const numberCourseFields: string[] = ["year","avg","pass","fail","audit"];
	const numberRoomFields: string[] = ["lat","lon","seats"];
	if (!(typeof query === "object") || Array.isArray(query)) {
		throw new InsightError("LT should be an object");
	}
	if (Object.keys(query).length !== 1) {
		throw new InsightError("LT can only have one key");
	}
	const ltKey = Object.keys(query)[0];
	const ltValue = query[ltKey];
	const ltId = ltKey.split("_")[0];
	if (ltId !== id) {
		throw new InsightError("Invalid ID in eq");
	}
	const field = ltKey.split("_")[1];
	if (kind === InsightDatasetKind.Sections) {
		if ((numberCourseFields.find((element) => element === field)) === undefined) {
			throw new InsightError("Invalid field in LT (should have sections field)");
		}
	} else {
		if ((numberRoomFields.find((element) => element === field)) === undefined) {
			throw new InsightError("Invalid field in LT (should have rooms field)");
		}
	}
	if (typeof ltValue !== "number") {
		throw new InsightError("Invalid type in LT");
	}
	const filteredData = data.filter(function (eachData: any){
		if (eachData[field] < ltValue) {
			return true;
		} else {
			return false;
		}
	});
	// console.log("filteredData:", filteredData);
	return filteredData;
}
export default ltController;
