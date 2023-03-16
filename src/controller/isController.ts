import InsightFacade from "./InsightFacade";
import {InsightDatasetKind, InsightError} from "./IInsightFacade";
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
function isController(query: any, data: any, id: string, kind: InsightDatasetKind): any {
	const stringCourseFields: string[] = ["uuid","id","title","instructor","dept"];
	const stringRoomFields: string[] = ["fullname","shortname","number","name","address","type","furniture","href"];
	if (!(typeof query === "object") || Array.isArray(query)) {
		throw new InsightError("IS should be an object");
	}
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
	if (kind === InsightDatasetKind.Sections) {
		if ((stringCourseFields.find((element) => element === field)) === undefined) {
			throw new InsightError("Invalid field in IS (should have sections field)");
		}
	} else {
		if ((stringRoomFields.find((element) => element === field)) === undefined) {
			throw new InsightError("Invalid field in IS (should have rooms field)");
		}
	}
	if (typeof isValue !== "string") {
		throw new InsightError("Invalid type in IS");
	}
	return handleWildcards(isValue,field,data);
}
export default isController;
