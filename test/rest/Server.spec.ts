import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import chaiHttp from "chai-http";
import chai, {expect, use} from "chai";
import request, {Response} from "supertest";
import {Application} from "express";
import * as fs from "fs-extra";


describe("Server", () => {

	let facade: InsightFacade;
	let server: Server;
	let express: Application;
	const SERVER_URL = "http://localhost:4321";
	use(chaiHttp);

	before(async () => {
		facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
		await server.start().then(() => {
			console.log("SERVER START");
			express = server.getExpress();
			console.info("App::initServer() - started");
		}).catch((err: Error) => {
			console.error(`App::initServer() - ERROR: ${err.message}`);
		});
	});

	after(async () => {
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
		const ENDPOINT_URL = "/dataset/veryValidId/sections";
		try {
			const ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/pair.zip");
			return request(express)
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

	it("DELETE test for courses dataset", () => {
		console.log("DELETE DATASET");
		const ENDPOINT_URL = "/dataset/veryValidId";
		try {
			return request(express)
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

	it("POST query test for courses dataset", () => {
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
			return request(express)
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

		// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
