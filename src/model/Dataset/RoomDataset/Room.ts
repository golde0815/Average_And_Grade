import {IBuildingData, IGeoLocation} from "./RDataset";
import {parse} from "parse5";
import {HTMLParser} from "./HTMLParser";
import {IData} from "../IDataset";

export interface IRoomAndBuilding extends IData {
	fullname: string;      // Full building name (e.g., "Hugh Dempster Pavilion").
	shortname: string;     // Short building name (e.g., "DMP").
	number: string;        // The room number (e.g., "201").
	name: string; 		   // The room id; should be rooms_shortname+"_"+rooms_number.
	address: string;       // The building address. (e.g., "6245 Agronomy Road V6T 1Z4").
	lat: number;		   // The latitude of the building, as received via HTTP request.
	lon: number;		   // The longitude of the building, as received via HTTP request.
	seats: number;		   // The number of seats in the room. The default value for this field is 0.
	type: string;		   // The room type (e.g., "Small Group").
	furniture: string;     // The room furniture (e.g., "Classroom-Movable Tables & Chairs").
	href: string           // The link to full rooms
}

export interface IRoomData {
	number?: string;        // The room number (e.g., "201").
	seats?: number;		   // The number of seats in the room. The default value for this field is 0.
	type?: string;		   // The room type (e.g., "Small Group").
	furniture?: string;     // The room furniture (e.g., "Classroom-Movable Tables & Chairs").
	href?: string           // The link to full rooms
}

export type RoomFieldType = keyof typeof Room.fieldType;

export class Room extends HTMLParser{
	public static fieldType = {
		fullname: "s",
		shortname: "s",
		number: "s",
		name: "s",
		address: "s",
		lat: "n",
		lon: "n",
		seats: "n",		// TODO: can it be negative or non-integer?
		type: "s",
		furniture: "s",
		href: "s"
	};

	// IF the IRoom list length is 0  throw error to skip this building
	public static parseRoom(
		buildingHtmlFile: string, buildingInfo: IBuildingData, geoLocation: IGeoLocation
	): IRoomAndBuilding[] {
		let instance: Room = new Room();
		let result: IRoomAndBuilding[] = [];
		let document;
		try {
			document = parse(buildingHtmlFile);
		} catch (err) {
			throw Error("Invalid building html file");
		}
		let rooms: IRoomData[] = instance.traverseJsonOfHTML(document) as IRoomData[];
		rooms.forEach((roomData) => {
			let roomAndBuilding: any = {};
			roomAndBuilding.fullname = buildingInfo.fullname;
			roomAndBuilding.shortname = buildingInfo.shortname;
			roomAndBuilding.number = roomData.number;
			roomAndBuilding.name = buildingInfo.shortname + "_" + roomAndBuilding.number;
			roomAndBuilding.address = buildingInfo.address;
			roomAndBuilding.lat = geoLocation.lat;
			roomAndBuilding.lon = geoLocation.lon;
			roomAndBuilding.seats = roomData.seats;
			roomAndBuilding.type = roomData.type;
			roomAndBuilding.furniture = roomData.furniture;
			roomAndBuilding.href = roomData.href;
			if (Object.keys(roomAndBuilding).length === 11 && instance.isValidRoomData(roomAndBuilding)) {
				result.push(roomAndBuilding);
			}
		});
		if (result.length === 0) {
			throw Error("No rooms in the building.");
		}
		return result;
	}

	// Read room Number and the link
	public readRoomNumberAndHref(datacell: any, room: any) {
		if (this.checkNodeAttributes(datacell.attrs, "class", "views-field views-field-field-room-number")) {
			let roomNumberAndLink: {text: string, link: string};
			roomNumberAndLink = this.readLinkAndTextData(datacell.childNodes);
			room.number = roomNumberAndLink.text;
			room.href = roomNumberAndLink.link;
		}
	}

	// Read room capacity, furniture and type
	public readRoomPhysicalProps(datacell: any, room: any) {
		if (this.checkNodeAttributes(datacell.attrs, "class", "views-field views-field-field-room-type")) {
			try {
				room.type = this.readTextData(datacell.childNodes);
			} catch (err) {
				throw Error("Room type data not available");
			}
		} else if (this.checkNodeAttributes(datacell.attrs, "class", "views-field views-field-field-room-furniture")) {
			try {
				room.furniture = this.readTextData(datacell.childNodes);
			} catch (err) {
				throw Error("Room furniture data not available");
			}
		} else if (this.checkNodeAttributes(datacell.attrs, "class", "views-field views-field-field-room-capacity")) {
			try {
				let capacity: number;
				capacity = parseInt(this.readTextData(datacell.childNodes), 10);
				room.seats = isNaN(capacity) ? 0 : capacity;
			} catch (err) {
				throw Error("Room seats data not available");
			}
		}
	}

	public extractDataInRow(trChildNodes: any[]): IRoomData {
		let roomData: IRoomData = {};
		trChildNodes.forEach((child) => {
			if (child.nodeName === "td" && child.tagName === "td") {
				try {
					this.readRoomNumberAndHref(child, roomData);
					this.readRoomPhysicalProps(child, roomData);
				} catch (err) {
					return;
				}
			}
		});
		if (Object.keys(roomData).length === 5 && this.isValidRoomData(roomData)) {
			return roomData;
		}
		throw Error("Missing or invalid information of the Room");
	}
}
