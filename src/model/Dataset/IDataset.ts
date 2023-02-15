import {InsightDatasetKind} from "../../controller/IInsightFacade";
import {ICourse} from "./CourseDataset/Course";
import {IRoomAndBuilding} from "./RoomDataset/Room";
import {ISection} from "./CourseDataset/Section";

export interface IDataset {
	id: string,
	kind: InsightDatasetKind,
	dataList: IData[],
	numRows: number
}

export interface IData {
	[key: string]: string | number;
}

export interface IDatasetParser {
	parseDataset(id: string, content: string): Promise<IDataset>;
}
