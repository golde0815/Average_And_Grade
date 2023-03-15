import {Room} from "./Room";

export class Building {
	private readonly fullname: string;
	private readonly shortname: string;
	private readonly address: string;
	private readonly lat: number;
	private readonly lon: number;
	private readonly path: string;
	private readonly rooms: Room[];


	constructor(fullname: string, shortname: string, address: string,
		lat: number, lon: number, path: string, rooms: Room[]) {
		this.fullname = fullname;
		this.shortname = shortname;
		this.address = address;
		this.lat = lat;
		this.lon = lon;
		this.path = path;
		this.rooms = rooms;
	}

	public getRows() {
		return this.rooms.length;
	}
}
