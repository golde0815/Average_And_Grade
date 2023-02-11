import {InsightResult} from "./IInsightFacade";

function optionController(query: any, result: InsightResult[]): InsightResult[] {
	const numOfIResult = result.length;
	console.log("How many InsightResult: ", numOfIResult);
	console.log("query.ORDER: ", query);
	console.log("before ordering: ", result);
	for (let i = 1; i < numOfIResult; i++) {
		if (result[i][query], result[i - 1][query]) {
			const temp = result[i][query];
			while (i > 0 && result[i - 1][query] > temp) {
				result[i][query] = result[i - 1][query];
				i--;
			}
			result[i][query] = temp;
		}
	}
	console.log("after ordering: ", result);
	return result;
}
export default optionController;
