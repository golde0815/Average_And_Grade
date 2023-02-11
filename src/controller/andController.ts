import gtController from "./gtController";
import {InsightError} from "./IInsightFacade";
import isController from "./isController";
function andController(query: any, data: any): any {
	console.log("query = ", query);
	console.log("data = ", data);
	console.log("Inside AND = ", query);
	console.log("length of query = ", query.length);
	// reject if query does not have two sub-queries
	if (query.length !== 2) {
		throw new InsightError("There should be only two sub-queries for AND");
	}
	const firstAndStatement = query[0];
	console.log("query[0]: ", query[0]);
	let filteredData = data;
	if (firstAndStatement.GT) {
		 filteredData = gtController(firstAndStatement.GT, data);
	}
	// else if (firstAndStatement.LT) {
	// 	filteredData = ltController(firstAndStatement.GT, data);
	// } else if
	const secondAndStatement = query[1];
	console.log("filteredData after gt: ", filteredData);
	if (secondAndStatement.IS){
		filteredData = isController(secondAndStatement.IS,filteredData);
	}
	return filteredData;
}
export default andController;
