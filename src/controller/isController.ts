import InsightFacade from "./InsightFacade";
import {InsightError} from "./IInsightFacade";
function handleWildcards(isValue: string, field: string, data: any): any {
	let filteredData: any;
	if (isValue === "*") {
		filteredData = data;
	} else if (isValue.substring(1, isValue.length - 1).includes("*")) {
		throw new InsightError("* can only be at first or last character");
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
	} else {
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
function isController(query: any, data: any, id: string): any {
	const stringFields: string[] = ["uuid","id","title","instructor","dept"];
	if (Object.keys(query).length !== 1) {
		throw new InsightError("IS can only have one key");
	}
	const isKey = Object.keys(query)[0];
	const isValue = query[isKey];
	const isId = isKey.split("_")[0];
	if (isId !== id) {
		throw new InsightError("Invalid ID in IS");
	}
	const field = isKey.split("_")[1];
	// console.log("In stringFields:",(stringFields.find((element) => element === field)));
	if ((stringFields.find((element) => element === field)) === undefined) {
		throw new InsightError("Invalid field in IS");
	}
	if (typeof isValue !== "string") {
		throw new InsightError("Invalid type in IS");
	}
	return handleWildcards(isValue,field,data);
}
export default isController;
