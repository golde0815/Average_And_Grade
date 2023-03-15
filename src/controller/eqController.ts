import InsightFacade from "./InsightFacade";
import {InsightDatasetKind, InsightError} from "./IInsightFacade";

function eqController(query: any, data: any, id: string, kind: InsightDatasetKind): any {
	const numberCourseFields: string[] = ["year","avg","pass","fail","audit"];
	const numberRoomFields: string[] = ["lat","lon","seats"];
	if (Object.keys(query).length !== 1) {
		throw new InsightError("EQ can only have one key");
	}
	const eqKey = Object.keys(query)[0];
	const eqValue = query[eqKey];
	const eqId = eqKey.split("_")[0];
	if (eqId !== id) {
		throw new InsightError("Invalid ID in EQ");
	}
	const field = eqKey.split("_")[1];
	if (kind === InsightDatasetKind.Sections) {
		if ((numberCourseFields.find((element) => element === field)) === undefined) {
			throw new InsightError("Invalid field in EQ (should have sections field)");
		}
	} else {
		if ((numberRoomFields.find((element) => element === field)) === undefined) {
			throw new InsightError("Invalid field in EQ (should have rooms field)");
		}
	}
	if (typeof eqValue !== "number") {
		throw new InsightError("Invalid type in EQ");
	}
	const filteredData = data.filter(function (eachData: any){
		if (eachData[field] === eqValue) {
			return true;
		} else {
			return false;
		}
	});
	// console.log("filteredData:", filteredData);
	return filteredData;
}
export default eqController;
