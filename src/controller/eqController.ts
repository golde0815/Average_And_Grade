import InsightFacade from "./InsightFacade";
import {InsightError} from "./IInsightFacade";

function eqController(query: any, data: any): any {
	const numberFields: string[] = ["year","avg","pass","fail","audit"];
	console.log("query = ", query);
	console.log("data = ", data);

	console.log("Inside EQ:", query);
	const eqKey = Object.keys(query)[0];
	const eqValue = query[eqKey];
	console.log("eqKey:", eqKey);
	console.log("eqKey type:", typeof eqKey);
	console.log("eqValue:", eqValue);
	console.log("eqValue type:", typeof eqValue);
	const field = eqKey.substring(9);
	console.log("In numberFields:",(numberFields.find((element) => element === field)));
	if ((numberFields.find((element) => element === field)) === undefined) {
		throw new InsightError("Invalid field");
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
