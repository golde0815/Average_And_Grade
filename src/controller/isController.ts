import InsightFacade from "./InsightFacade";
import {InsightError} from "./IInsightFacade";
function handleWildcards(isValue: string, field: string, data: any): any {
	let filteredData: any;
	if (isValue === "*") {
		// filteredData = data.filter(function (eachData: any){
		// 	if (eachData[field].indexOf("") !== -1) {
		// 		return true;
		// 	} else {
		// 		return false;
		// 	}
		// }
		filteredData = data;
	} else if ((isValue[0] === "*") && (isValue[isValue.length - 1] === "*")) {
		const isValueWildCard = isValue.substring(1,isValue.length - 1);
		filteredData = data.filter(function (eachData: any){
			if (eachData[field].indexOf(isValueWildCard) !== -1) {
				return true;
			} else {
				return false;
			}
		});
	} else if ((isValue[0] === "*") && (isValue.length > 1)) {
		const isValueWildCard = isValue.substring(1);
		filteredData = data.filter(function (eachData: any){
			if (eachData[field].endsWith(isValueWildCard)) {
				return true;
			} else {
				return false;
			}
		});
	} else if ((isValue[isValue.length - 1] === "*") && (isValue.length > 1)) {
		const isValueWildCard = isValue.substring(0,isValue.length - 1);
		filteredData = data.filter(function (eachData: any){
			if (eachData[field].startsWith(isValueWildCard)) {
				return true;
			} else {
				return false;
			}
		});
	}else {
		filteredData = data.filter(function (eachData: any){
			if (eachData[field] === isValue) {
				return true;
			} else {
				return false;
			}
		});
	}
	return filteredData;
}
function isController(query: any, data: any): any {
	const stringFields: string[] = ["uuid","id","title","instructor","dept"];
	const isKey = Object.keys(query)[0];
	const isValue = query[isKey];
	const field = isKey.substring(9);
	console.log("In stringFields:",(stringFields.find((element) => element === field)));
	if ((stringFields.find((element) => element === field)) === undefined) {
		throw new InsightError("Invalid field in IS");
	}
	if (typeof isValue !== "string") {
		throw new InsightError("Invalid type in IS");
	}
	return handleWildcards(isValue,field,data);
}
export default isController;
