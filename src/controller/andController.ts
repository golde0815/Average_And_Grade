import InsightFacade from "./InsightFacade";
import {InsightError} from "./IInsightFacade";
import processWhere from "./processWhere";

function andController(query: any, data: any, id: string): any {
	if (query.length !== 2) {
		throw new InsightError("There should be only two sub-queries for AND");
	}
	data = processWhere(query[0], data, id);
	data = processWhere(query[1], data, id);
	return data;
}
export default andController;
