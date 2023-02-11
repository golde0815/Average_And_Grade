import InsightFacade from "./InsightFacade";
import {InsightError} from "./IInsightFacade";

function gtController(query: any, data: any): any {
	const numberFields: string[] = ["year","avg","pass","fail","audit"];
	console.log("query = ", query);
	console.log("data = ", data);

	console.log("Inside GT:", query);
	const gtKey = Object.keys(query)[0];
	const gtValue = query[gtKey];
	console.log("gtKey:", gtKey);
	console.log("gtKey type:", typeof gtKey);
	console.log("gtValue:", gtValue);
	console.log("gtValue type:", typeof gtValue);
	const field = gtKey.substring(9);
	console.log("In numberFields:",(numberFields.find((element) => element === field)));
	if ((numberFields.find((element) => element === field)) === undefined) {
		throw new InsightError("Invalid field");
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
