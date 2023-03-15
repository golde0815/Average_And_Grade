import {Room} from "./Room";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import {Building} from "./Building";
import {parse} from "parse5";
import JSZip from "jszip";
import * as http from "http";

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

	private addBuilding(table: any, fullname: string, shortname: string, address: string,
		lat: number, lon: number, path: string) {
		let rooms: Room[];
		rooms = [];
		if (table !== null) {
			for (const row of table.childNodes) {
				if (row.nodeName === "tr" && row.childNodes) {
					let roomNumber, type, furniture, href: string;
					let seats: number;
					roomNumber = row.childNodes[1].childNodes[1].childNodes[0].value.trim();
					seats = row.childNodes[3].childNodes[1].childNodes[0].value.trim();
					furniture = row.childNodes[5].childNodes[1].childNodes[0].value.trim();
					type = row.childNodes[7].childNodes[1].childNodes[0].value.trim();
					href = row.childNodes[9].childNodes[1].attrs[0].value;
					let room = new Room(fullname, shortname, roomNumber, shortname + "_" + roomNumber, address, lat,
						lon, seats, type, furniture, href);
					rooms.push(room);
				}
			}
		}
		let building = new Building(fullname, shortname, address, lat, lon, path, rooms);
		this.buildings.push(building);
		this.numRows += building.getRows();
	}

	public buildingsHelper(zip: JSZip): Promise<any> { // main building helper
		return new Promise<any>((resolve, reject) => {
			if (zip.folder("campus/discover/buildings-and-classrooms") === null) { // makes sure there is content in the zip file
				reject(new InsightError("Invalid content (no buildings)"));
			}
			let indexText = zip.file("index.htm"); // load the index file
			if (indexText) {
				indexText.async("string").then((text) => {
					let index = parse(text);
					let buildingTable: any; // this is the table for buildings
					buildingTable = this.recursiveBuildingsFinder(index);
					if (!buildingTable) {
						reject(new InsightError("Invalid index.htm"));
					} else {
						return buildingTable;
					}
				}).then((buildingTable) => {
					return this.processBuildings(zip, buildingTable);
				}).then((promise) => {
					resolve(promise);
				}).catch(() => {
					reject(new InsightError("Strange error at indextext.async"));
				});
			} else {
				reject(new InsightError("No index.htm"));
			}
		});
	}

	private recursiveBuildingsFinder(node: any): any {
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

	private recursiveRoomsFinder(node: any): any {
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
				let tableNode = this.recursiveRoomsFinder(childNode);
				if (tableNode) {
					return tableNode;
				}
			}
		}
	}

	private processBuildings(zip: JSZip, table: any): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			let promises: Array<Promise<any>> = [];
			for (const row of table.childNodes) {
				if (row.nodeName === "tr" && row.childNodes) {
					let fullname: string, shortname: string, address: string, path: string;
					let lat: number, lon: number;
					shortname = row.childNodes[3].childNodes[0].value.trim();
					fullname = row.childNodes[5].childNodes[1].childNodes[0].value.trim();
					address = row.childNodes[7].childNodes[0].value.trim();
					path = row.childNodes[1].childNodes[1].attrs[0].value;
					let buildingPromise: Promise<any> = this.getLoc(address)
						.then((geolocation) => {
							lat = geolocation[0];
							lon = geolocation[1];
						}).then(() => {
							let buildingText = zip.file(path.substring(2) + ".htm");
							if (buildingText) {
								return buildingText.async("string")
									.then((text) => {
										let building = parse(text);
										let roomsTable: any;
										roomsTable = this.recursiveRoomsFinder(building);
										if (!roomsTable) {
											roomsTable = null;
										}
										return roomsTable;
									}).then((roomsTable) => {
										this.addBuilding(roomsTable, fullname, shortname, address, lat, lon, path);
									});
							} else {
								reject(new InsightError("Missing .htm file for building"));
							}
						});
					promises.push(buildingPromise);
				}
			}
			resolve(Promise.all(promises));
		});
	}

	private getLoc(address: string): Promise<any[]> { // get geolocation
		return new Promise<any[]>((resolve, reject) => {
			let url = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team184/" + address;
			http.get(url, (res) => {
				const {statusCode} = res;
				if (statusCode !== 200) {
					reject(new InsightError("Error Code ${statusCode}"));
				}
				res.setEncoding("utf8");
				let rawData = "";
				res.on("data", (chunk) => {
					rawData += chunk;
				});
				res.on("end", () => {
					let geolocation = JSON.parse(rawData) as {lat?: number; lon?: number; error?: string};
					if (geolocation.error) {
						reject(new Error(geolocation.error));
					} else {
						resolve([geolocation.lat, geolocation.lon]);
					}
				});
			});
		});
	}
}
