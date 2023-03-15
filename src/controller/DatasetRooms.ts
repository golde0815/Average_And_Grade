import {Room} from "./Room";
import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {Building} from "./Building";
import {parse} from "parse5";
import {Document} from "parse5/dist/tree-adapters/default";

export class DatasetRooms implements InsightDataset{
	public id: string;
	public kind: InsightDatasetKind;
	public numRows: number;
	public buildings: Building[];

	constructor(id: string, kind: InsightDatasetKind) {
		this.id = id;
		this.kind = kind;
		this.buildings = [];
		this.numRows = 0;
	}

	public addBuilding(tree: Document) {
		/*
		let buildingData = tree
		let rooms: Room[];
		rooms = [];
		for (const roomData of buildingData.result) {
			let room = new Room(roomData.id, roomData.Course, roomData.Title,
				roomData.Professor, roomData.Subject, roomData.Year, roomData.Avg, roomData.Pass,
				roomData.Fail, roomData.Audit, roomData.Section);
			rooms.push(room);
		}
		let building = new Building(rooms);
		this.buildings.push(building);
		this.numRows += building.getRows();
		*/
	}
}
