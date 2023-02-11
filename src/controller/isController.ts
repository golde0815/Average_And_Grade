import InsightFacade from "./InsightFacade";
import {InsightError} from "./IInsightFacade";

function isController(query: any, data: any): any {
	const stringFields: string[] = ["uuid","id","title","instructor","dept"];
	console.log("query = ", query);
	console.log("data = ", data);
	console.log("Inside IS:", query);

	const isKey = Object.keys(query)[0];
	const isValue = query[isKey];
	console.log("isKey:", isKey);
	console.log("isKey type:", typeof isKey);
	console.log("isValue:", isValue);
	console.log("isValue type:", typeof isValue);
	const field = isKey.substring(9);
	console.log("In stringFields:",(stringFields.find((element) => element === field)));
	if ((stringFields.find((element) => element === field)) === undefined) {
		throw new InsightError("Invalid field");
	}
	const filteredData = data.filter(function (eachData: any){
		if (eachData[field] === isValue) {
			return true;
		} else {
			return false;
		}
	});
	// console.log("filteredData:", filteredData);
	return filteredData;
}
export default isController;
