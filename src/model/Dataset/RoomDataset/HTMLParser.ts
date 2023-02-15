import {IBuildingData} from "./RDataset";
import {RoomFieldType, IRoomAndBuilding, IRoomData, Room} from "./Room";

export abstract class HTMLParser {
	/**
	 * Given the childNodes of a table row (tr), extract the required data or throw error
	 * @param trChildNodes
	 * @protected
	 * @return the extracted IBuilding or IRoomData
	 * @throws error if table data structure is invalid or missing fields
	 */
	protected abstract extractDataInRow(trChildNodes: any[]): IBuildingData | IRoomData;

	public readLinkAndTextData(tdChildNodes: any[]): {text: string, link: string} {
		let result = {text: "", link: ""};
		const anchors = tdChildNodes.filter((childNode) => childNode.nodeName === "a" && childNode.tagName === "a"
			&& this.checkNodeAttributes(childNode.attrs, "href", "/"));
		if (anchors.length === 0) {
			throw Error("Missing anchor");
		}
		try {
			result.text = this.readTextData(anchors[0].childNodes);
		} catch (err) {
			throw(Error("Missing data in text field"));
		}
		result.link = this.getHref(anchors[0].attrs);
		return result;
	}

	protected getHref(anchorAttributes: any[]): string {
		if (anchorAttributes && Array.isArray(anchorAttributes) && anchorAttributes.length) {
			let hrefs: any[] = anchorAttributes.filter((attribute: any) => attribute.name === "href");
			if (hrefs.length > 0) {
				return hrefs[0].value;
			}
		}
		throw Error ("Link (href) is missing");
	}

	public readTextData(tdChildNodes: any[]): string {
		if (tdChildNodes && Array.isArray(tdChildNodes) && tdChildNodes.length) {
			let infoList: any[] = tdChildNodes.filter((info) => info.nodeName === "#text");
			if (infoList.length > 0) {
				return infoList[0].value.trim();
			}
		}
		throw Error("Data is missing");
	}

	public checkNodeAttributes(attributes: any[], name: string, value: string): boolean {
		if (!(attributes && Array.isArray(attributes) && attributes.length)) {
			return false;
		}
		const arrayResult = attributes.filter((attribute)=> attribute.name === name
			&& (attribute.value as string).includes(value));
		return arrayResult.length > 0;
	}

	public traverseJsonOfHTML(jsonOfHTMLElement: any): Array<IBuildingData | IRoomData> {
		let deeperData: Array<IBuildingData | IRoomData> = [];
		if (!(jsonOfHTMLElement && jsonOfHTMLElement.nodeName
			&& jsonOfHTMLElement.childNodes
			&& Array.isArray(jsonOfHTMLElement.childNodes) && jsonOfHTMLElement.childNodes.length)) {
			return [];
		}
		if (jsonOfHTMLElement.nodeName === "tr" && jsonOfHTMLElement.tagName === "tr") {
			try {
				const res = this.extractDataInRow(jsonOfHTMLElement.childNodes);
				return [res];
			} catch (err) {
				// Skip and proceed because data may be more nested
			}
		}
		jsonOfHTMLElement.childNodes.forEach((child: any)=> {
			deeperData = [...deeperData, ...this.traverseJsonOfHTML(child)];
		});
		return deeperData;
	}

	// TODO: code needs double checking
	protected isValidRoomData(data: object): boolean {
		for (let [key, val] of Object.entries(data)) {
			switch (Room.fieldType[key as RoomFieldType]) {
				case ("s"):
					if (typeof val !== "string") {
						return false;
					}
					break;
				case ("n"):
					if(typeof val !== "number") {
						return false;
					}
					break;
				default:
					return false;
			}
		}
		return true;
	}
}
