import InsightFacade from "./InsightFacade";
import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import processWhere from "./processWhere";

function andController(query: any, data: any, id: string, kind: InsightDatasetKind): any {
	if (!Array.isArray(query)) {
		throw new InsightError("AND should be an array");
	}
	if (query.length === 0) {
		throw new InsightError("There should be one or more sub-queries for AND");
	}
	for (let i in query) {
		if (!(typeof query[i] === "object")) {
			throw new InsightError("AND array should have objects");
		}
		data = processWhere(query[i], data, id, kind);
	}
	// data = processWhere(query[0], data, id);
	// data = processWhere(query[1], data, id);
	return data;
}
export default andController;
