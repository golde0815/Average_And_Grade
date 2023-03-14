import {InsightError, InsightResult} from "./IInsightFacade";

function orderController(query: any, result: InsightResult[]): InsightResult[] {
	if (typeof query.ORDER === "string") {
		if ((query.COLUMNS.find((element: string) => element === query["ORDER"])) === undefined) {
			throw new InsightError("ORDER Key must be in Columns");
		}
		const sortedArray = result.sort((i1: InsightResult, i2: InsightResult) =>
			(i1[query.ORDER] < i2[query.ORDER] ? -1 : 1)
		);
		return sortedArray;
	} else if (typeof query.ORDER === "object") {
		if (!query.ORDER.dir || !query.ORDER.keys || Object.keys(query.ORDER).length !== 2) {
			throw new InsightError("Invalid order");
		}
		for (let key of query.ORDER.keys) {
			if (query.COLUMNS.find((element: string) => element === key) === undefined) {
				throw new InsightError("keys must be in columns");
			}
		}
		let direction: number = 0;
		if (query.ORDER.dir === "UP") {
			direction = 1;
		} else if (query.ORDER.dir === "DOWN") {
			direction = -1;
		} else {
			throw new InsightError("Invalid direction");
		}
		let sortedArray: InsightResult[] = result;
		sortedArray.sort((i1: InsightResult, i2: InsightResult) => {
			for (let key of query.ORDER.keys) {
				if (i1[key] > i2[key]) {
					return direction;
				} else if (i1[key] < i2[key]) {
					return direction * -1;
				} else {
					return 0;
				}
			}
			return 0;
		});
		return sortedArray;
	} else {
		throw new InsightError("Invalid order type");
	}
}
export default orderController;
