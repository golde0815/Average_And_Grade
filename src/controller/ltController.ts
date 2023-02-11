import InsightFacade from "./InsightFacade";
import {InsightError} from "./IInsightFacade";

function ltController(query: any, data: any): any {
	const numberFields: string[] = ["year","avg","pass","fail","audit"];
	console.log("query = ", query);
	console.log("data = ", data);

	console.log("Inside LT:", query);
	const ltKey = Object.keys(query)[0];
	const ltValue = query[ltKey];
	console.log("ltKey:", ltKey);
	console.log("ltKey type:", typeof ltKey);
	console.log("ltValue:", ltValue);
	console.log("ltValue type:", typeof ltValue);
	const field = ltKey.substring(9);
	console.log("In numberFields:",(numberFields.find((element) => element === field)));
	if ((numberFields.find((element) => element === field)) === undefined) {
		return Promise.reject(new InsightError("Invalid field"));
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
