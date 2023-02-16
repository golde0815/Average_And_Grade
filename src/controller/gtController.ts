import InsightFacade from "./InsightFacade";
import {InsightError} from "./IInsightFacade";

function gtController(query: any, data: any, id: string): any {
	const numberFields: string[] = ["year","avg","pass","fail","audit"];
	if (Object.keys(query).length !== 1) {
		throw new InsightError("GT can only have one key");
	}
	const gtKey = Object.keys(query)[0];
	const gtValue = query[gtKey];
	const gtId = gtKey.split("_")[0];
	if (gtId !== id) {
		throw new InsightError("Invalid ID in GT");
	}
	// console.log("gtKey:", gtKey);
	// console.log("gtKey type:", typeof gtKey);
	// console.log("gtValue:", gtValue);
	// console.log("gtValue type:", typeof gtValue);
	const field = gtKey.split("_")[1];
	// console.log("In numberFields:",(numberFields.find((element) => element === field)));
	if ((numberFields.find((element) => element === field)) === undefined) {
		throw new InsightError("Invalid field in GT");
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
