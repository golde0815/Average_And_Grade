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
					if (!row.childNodes[1] || !row.childNodes[3] || !row.childNodes[5] || !row.childNodes[7]
						|| !row.childNodes[9]) {
						continue;
					}
					roomNumber = row.childNodes[1].childNodes[1].childNodes[0].value.trim();
					// seats = row.childNodes[3].childNodes[1].childNodes[0].value.trim();
					seats = row.childNodes[3].childNodes[0] &&
						row.childNodes[3].childNodes[0].value.trim();
					// furniture = row.childNodes[5].childNodes[1].childNodes[0].value.trim();
					furniture = row.childNodes[5].childNodes[0] &&
						row.childNodes[5].childNodes[0].value.trim();
					// type = row.childNodes[7].childNodes[1].childNodes[0].value.trim();
					type = row.childNodes[7].childNodes[0] &&
						row.childNodes[7].childNodes[0].value.trim();
					// href = row.childNodes[9].childNodes[1].attrs[0].value;
					href = row.childNodes[9].childNodes[1] && row.childNodes[9].childNodes[1].attrs[0].value;
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
			// if (!(Object.keys(zip.files).length > 3)
			// || !Object.keys(zip.files)[0].includes("campus/")
			// || !Object.keys(zip.files)[1].includes("campus/discover/")
			// || !Object.keys(zip.files)[2].includes("campus/discover/buildings-and-classrooms")) { // makes sure there is content in the zip file
			// 	reject(new InsightError("Invalid content (no buildings folder)"));
			// }
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
				}).catch((err) => {
					console.log("err: ", err);
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
					if (childNode.nodeName === "tbody"  && this.validateTable(childNode)) {
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

	private validateTable(table: any): boolean {
		for (const row of table.childNodes) {
			if (row.childNodes) {
				for (const td of row.childNodes) {
					if (td.nodeName === "td" && td.attrs[0].name === "class" &&
						td.attrs[0].value === "views-field views-field-field-building-address") {
						return true;
					}
				}
			}
		}
		return false;
	}

	private processBuildings(zip: JSZip, table: any): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			let promises: Array<Promise<any>> = [];
			for (const row of table.childNodes) {
				if (row.nodeName === "tr" && row.childNodes) {
					let fullname: string, shortname: string, address: string, path: string;
					let lat: number, lon: number;
					if (!row.childNodes[3] || !row.childNodes[5] || !row.childNodes[7] || !row.childNodes[9] ||
						!row.childNodes[3].childNodes[0] || !row.childNodes[5].childNodes[1] ||
						!row.childNodes[7].childNodes[0]) {
						continue;
					}
					shortname = row.childNodes[3].childNodes[0].value.trim();
					fullname = row.childNodes[5].childNodes[1].childNodes[0].value.trim();
					address = row.childNodes[7].childNodes[0].value.trim();
					path = row.childNodes[9].childNodes[1].attrs[0].value;
					let buildingPromise: Promise<any> = this.getLoc(address)
						.then((geolocation) => {
							lat = geolocation[0];
							lon = geolocation[1];
						}).then(() => {
							let buildingText = zip.file(path.substring(2));
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
								// reject(new InsightError("Missing .htm file for building"));
							}
						});
					promises.push(buildingPromise);
				}
			}
			Promise.all(promises).then((buildings) => {
				return resolve(buildings);
			});
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
