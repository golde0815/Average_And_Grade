import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect, use} from "chai";
import request, {Response} from "supertest";
import {Application} from "express";
import * as fs from "fs-extra";
import path from "path";


describe("Server", () => {

	let facade: InsightFacade;
	let server: Server;
	let express: Application;
	const SERVER_URL = "http://localhost:4321";

	before( () => {
		fs.removeSync("./data");
		facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
		return server.start().then(() => {
			console.log("SERVER START");
			express = server.getExpress();
			console.info("App::initServer() - started");
		}).catch((err: Error) => {
			console.error(`App::initServer() - ERROR: ${err.message}`);
		});
	});

	after( () => {
			// TODO: stop server here once!
		return server.stop();
	});

	beforeEach(() => {
			// might want to add some process logging here to keep track of what's going on
	});

	afterEach(() => {
			// might want to add some process logging here to keep track of what's going on
	});

		// Sample on how to format PUT requests

	it("PUT test for courses dataset", () => {
		console.log("ADD DATASET");
		const ENDPOINT_URL = "/dataset/sections/sections";
		try {
			const ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/pair.zip");
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res) => {
					expect(res.status).to.be.equal(200);
					console.log("");
					// more assertions here
				})
				.catch((err) => {
					console.log(err);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	it("PUT test for courses dataset", () => {
		console.log("ADD DATASET");
		const ENDPOINT_URL = "/dataset/sections2/sections";
		try {
			const ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/small.zip");
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res) => {
					expect(res.status).to.be.equal(200);
					console.log("");
					// more assertions here
				})
				.catch((err) => {
					console.log(err);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	it("PUT test for courses dataset again", () => {
		console.log("ADD DATASET");
		const ENDPOINT_URL = "/dataset/rooms/rooms";
		try {
			const ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/campus.zip");
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res) => {
					expect(res.status).to.be.equal(200);
					console.log("");
					// more assertions here
				})
				.catch((err) => {
					console.log(err);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	it("POST query test for rooms dataset", () => {
		console.log("POST QUERY");
		const ENDPOINT_URL = "/query";
		const query = {
			WHERE: {
				AND: [
					{IS: {sections_dept: "cpsc"}},
					{IS: {sections_id: "310"}}
				]
			},
			OPTIONS: {
				COLUMNS: [
					"sections_id",
					"sections_year",
					"overallAVG"
				],
				ORDER: {
					dir: "DOWN",
					keys: ["sections_year"]
				}
			},
			TRANSFORMATIONS: {
				GROUP: [
					"sections_id",
					"sections_year"
				],
				APPLY: [{overallAVG: {AVG: "sections_avg"}}
				]
			}
		};
		try {
			return request(SERVER_URL)
				.post(ENDPOINT_URL)
				.send(query)
				.set("Accept-Type", "application/json")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
						// more assertions here
				})
				.catch((err) => {
					console.log(err);
						// some logging here please!
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	it("POST invalid query", () => {
		console.log("POST QUERY");
		const ENDPOINT_URL = "/query";
		const query = {
			WHERE: {
				AND: [
					{IS: {sections_dept: "cpsc"}},
					{IS: {sections_id: "310"}}
				]
			},
			OPTIONS: {
				COLUMNS: [
					"sections_id",
					"sections_year",
					"overallAVG"
				],
				ORDER: {
					ir: "DOWN",
					keys: ["sections_year"]
				}
			},
			TRANSFORMATIONS: {
				GROUP: [
					"sections_id",
					"sections_year"
				],
				APPLY: [{overallAVG: {AVG: "sections_avg"}}
				]
			}
		};
		try {
			return request(SERVER_URL)
				.post(ENDPOINT_URL)
				.send(query)
				.set("Accept-Type", "application/json")
				.then((res: Response) => {
					expect(res.status).to.be.equal(400);
					// more assertions here
				})
				.catch((err) => {
					console.log(err);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	it("DELETE test for courses dataset", () => {
		console.log("DELETE DATASET");
		const ENDPOINT_URL = "/dataset/sections";
		try {
			return request(SERVER_URL)
				.delete(ENDPOINT_URL)
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
				})
				.catch((err) => {
					console.log(err);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	it("DELETE test for rooms dataset", () => {
		console.log("DELETE DATASET");
		const ENDPOINT_URL = "/dataset/rooms";
		try {
			return request(SERVER_URL)
				.delete(ENDPOINT_URL)
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
				})
				.catch((err) => {
					console.log(err);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	it("DELETE what's already deleted", () => {
		console.log("DELETE DATASET");
		const ENDPOINT_URL = "/dataset/rooms";
		try {
			return request(SERVER_URL)
				.delete(ENDPOINT_URL)
				.then((res: Response) => {
					expect(res.status).to.be.equal(404);
					// more assertions here
				})
				.catch((err) => {
					console.log(err);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	it("DELETE dataset that has invalid id", () => {
		console.log("DELETE DATASET");
		const ENDPOINT_URL = "/dataset/";
		try {
			return request(SERVER_URL)
				.delete(ENDPOINT_URL)
				.then((res: Response) => {
					expect(res.status).to.be.equal(400);
					// more assertions here
				})
				.catch((err) => {
					console.log(err);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	it("DELETE sections (already deleted)", () => {
		console.log("DELETE DATASET");
		const ENDPOINT_URL = "/dataset/sections";
		try {
			return request(SERVER_URL)
				.delete(ENDPOINT_URL)
				.then((res: Response) => {
					expect(res.status).to.be.equal(404);
					// more assertions here
				})
				.catch((err) => {
					console.log(err);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

		// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
