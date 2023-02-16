import {InsightResult} from "./IInsightFacade";

function orderController(query: any, result: InsightResult[]): InsightResult[] {
	const numOfIResult = result.length;
	// console.log("How many InsightResult: ", numOfIResult);
	 console.log("query.ORDER: ", query);
	// console.log("before ordering: ", result);
	const sortedArray = result.sort((i1: InsightResult, i2: InsightResult) =>
		(i1[query] < i2[query] ? -1 : 1)
	);
	// console.log("after ordering: ", result);
	return sortedArray;
}
export default orderController;
