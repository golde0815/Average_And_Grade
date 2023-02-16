import InsightFacade from "./InsightFacade";
import {InsightError} from "./IInsightFacade";

function ltController(query: any, data: any, id: string): any {
	const numberFields: string[] = ["year","avg","pass","fail","audit"];
	if (Object.keys(query).length !== 1) {
		throw new InsightError("LT can only have one key");
	}
	const ltKey = Object.keys(query)[0];
	const ltValue = query[ltKey];
	const ltId = ltKey.split("_")[0];
	if (ltId !== id) {
		throw new InsightError("Invalid ID in eq");
	}
	// console.log("ltKey:", ltKey);
	// console.log("ltKey type:", typeof ltKey);
	// console.log("ltValue:", ltValue);
	// console.log("ltValue type:", typeof ltValue);
	const field = ltKey.split("_")[1];
	// console.log("In numberFields:",(numberFields.find((element) => element === field)));
	if ((numberFields.find((element) => element === field)) === undefined) {
		throw new InsightError("Invalid field in LT");
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
