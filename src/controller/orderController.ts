import {InsightError, InsightResult} from "./IInsightFacade";

function orderController(query: any, result: InsightResult[]): InsightResult[] {
	// console.log("order: ", query);
	if (typeof query.ORDER === "string") {
		if ((query.COLUMNS.find((element: string) => element === query["ORDER"])) === undefined) {
			throw new InsightError("ORDER Key must be in Columns");
		}
		const sortedArray = result.sort((i1: InsightResult, i2: InsightResult) =>
			(i1[query.ORDER] < i2[query.ORDER] ? -1 : 1)
		);
		return sortedArray;
	} else if (typeof query.ORDER === "object") {
		// console.log("query.ORDER.length", Object.keys(query.ORDER).length);
		if (!query.ORDER.dir || !query.ORDER.keys || Object.keys(query.ORDER).length !== 2) {
			throw new InsightError("Invalid order");
		}
		return result;
	} else {
		throw new InsightError("Invalid order type");
	}
}
export default orderController;
