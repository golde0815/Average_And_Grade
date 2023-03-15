import {InsightDatasetKind, InsightError} from "./IInsightFacade";

function gtController(query: any, data: any, id: string, kind: InsightDatasetKind): any {
	const numberCourseFields: string[] = ["year","avg","pass","fail","audit"];
	const numberRoomFields: string[] = ["lat","lon","seats"];
	if (Object.keys(query).length !== 1) {
		throw new InsightError("GT can only have one key");
	}
	const gtKey = Object.keys(query)[0];
	const gtValue = query[gtKey];
	const gtId = gtKey.split("_")[0];
	if (gtId !== id) {
		throw new InsightError("Invalid ID in GT");
	}
	const field = gtKey.split("_")[1];
	if (kind === InsightDatasetKind.Sections) {
		if ((numberCourseFields.find((element) => element === field)) === undefined) {
			throw new InsightError("Invalid field in GT (should have sections field)");
		}
	} else {
		if ((numberRoomFields.find((element) => element === field)) === undefined) {
			throw new InsightError("Invalid field in GT (should have rooms field)");
		}
	}
	if (typeof gtValue !== "number") {
		throw new InsightError("Invalid type in GT");
	}
	const filteredData = data.filter(function (eachData: any){
		if (eachData[field] > gtValue) {
			return true;
		} else {
			return false;
		}
	});

	return filteredData;
}
export default gtController;
