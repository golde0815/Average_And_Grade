import {Room} from "./Room";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import {Building} from "./Building";
import {parse} from "parse5";
import {Document} from "parse5/dist/tree-adapters/default";
import JSZip from "jszip";

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

	public buildingsHelper(zip: JSZip): Promise<void[]> {
		return new Promise<void[]>((resolve, reject) => {
			if (zip.folder("campus/discover/buildings-and-classrooms") === null) {
				reject(new InsightError("Invalid content (no buildings)"));
			}
			let promises: Array<Promise<void>> = [];
			let buildingTable: any;
			let indexText = zip.file("index.htm");
			if (indexText) {
				indexText.async("string").then((text) => {
					let index = parse(text);
					buildingTable = this.recursiveBuildingsFinder(index);
					if (!buildingTable) {
						reject(new InsightError("Invalid index.htm"));
					}
				}).then(() => {
					console.log("A");
				});
			} else {
				reject(new InsightError("No index.htm"));
			}
			/* zip.folder("campus/discover/buildings-and-classrooms")?.forEach((relativePath, file) => {
				let coursePromise: Promise<void> = file.async("string")
					.then((text) => {
						let parsed = parse(text);
						dataset.addBuilding(parsed);
					}).catch(() => {
						reject(new InsightError("Invalid course content"));
					});
				promises.push(coursePromise);
			}); */
			resolve(Promise.all(promises));
		});
	}

	public recursiveBuildingsFinder(node: any): any {
		if (!node || node.nodeName === "#text") {
			return null;
		} else if (node.nodeName === "table" && node.attrs) {
			if (node.attrs[0].name === "class" && node.attrs[0].value === "views-table cols-5 table"
			&& node.childNodes) {
				for (const childNode of node.childNodes) {
					if (childNode.nodeName === "tbody") {
						return childNode;
					}
				}
			}
		}
		if (node.childNodes) {
			for (const childNode of node.childNodes) {
				let tableNode = this.recursiveBuildingsFinder(childNode);
				if (tableNode) {
					return tableNode;
				}
			}
		}

	}
}
