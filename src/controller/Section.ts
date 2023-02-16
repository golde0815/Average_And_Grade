export class Section {
	private readonly uuid: string;
	private readonly id: string;
	private readonly title: string;
	private readonly instructor: string;
	private readonly dept: string;
	private readonly year: number;
	private readonly avg: number;
	private readonly pass: number;
	private readonly fail: number;
	private readonly audit: number;


	constructor(uuid: number, id: string, title: string, instructor: string, dept: string, year: string, avg: number,
		pass: number, fail: number, audit: number, section: string) {
		this.uuid = String(uuid);
		this.id = id;
		this.title = title;
		this.instructor = instructor;
		this.dept = dept;
		if (section === "overall" || year === undefined) {
			this.year = 1900;
		} else {
			this.year = Number(year);
		}
		this.avg = avg;
		this.pass = pass;
		this.fail = fail;
		this.audit = audit;
	}
}
