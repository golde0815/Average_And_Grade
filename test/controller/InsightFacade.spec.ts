import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult, NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import {beforeEach} from "mocha";
import * as fs from "fs";
import path from "path";

use(chaiAsPromised);

describe("InsightFacade", function () {
	let facade: IInsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;

	before(function () {
		// Just in case there is anything hanging around from a previous run of the test suite
		clearDisk();
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			sections = getContentFromArchives("small.zip");
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			facade = new InsightFacade();
		});

		afterEach(function() {
			if (fs.existsSync("./data")) {
				fs.readdir("./data", (err, files) => {
					if (err) {
						throw err;
					}
					for (const file of files) {
						fs.unlink(path.join("./data", file), (error) => {
							if (error) {
								throw error;
							}
						});
					}
				});
			}
		});
		// This is a unit test. You should create more like this!
		it ("should reject with  an empty dataset id", function() {
			const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject a id that is all whitespace, mix of spaces tabs and breaks", function () {
			const result = facade.addDataset("         \n\n", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject a id that is all spaces", function () {
			const result = facade.addDataset("      ", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject a id that is all tabs", function () {
			const result = facade.addDataset("           ", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject a id that is all breaks", function () {
			const result = facade.addDataset("\n\n\n\n\n", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject a id that is blank", function () {
			const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should add valid dataset", function(){
			const result = facade.addDataset("valid",sections,InsightDatasetKind.Sections);
			return expect(result).to.eventually.deep.equal(["valid"]);
		});
		it("should reject duplicate ids", async function(){
			await facade.addDataset("valid",sections,InsightDatasetKind.Sections);
			try {
				await facade.addDataset("valid",sections,InsightDatasetKind.Sections);
				expect.fail("Should have rejected!");
			} catch(err){
				expect(err).to.be.instanceof(InsightError);
			}
		});
		it("should add three valid datasets", async function(){
			await facade.addDataset("valid",sections,InsightDatasetKind.Sections);
			await facade.addDataset("validtwo",sections,InsightDatasetKind.Sections);
			const result = await facade.addDataset("validthree",sections,InsightDatasetKind.Sections);
			return expect(result).to.deep.equal(["valid","validtwo","validthree"]);
		});
	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
			sections = getContentFromArchives("pair.zip");
			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [
				facade.addDataset("sections", sections, InsightDatasetKind.Sections),
			];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => facade.performQuery(input),
			"./test/resources/queries",
			{
				assertOnResult: async (actual, expected) => {
					expect(actual).to.have.deep.members(await expected);
					// console.log("checkpoint");
					// expect(actual).to.deep.equal(await expected);
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					if (expected === "InsightError") {
						expect(actual).to.be.instanceof(InsightError);
					} else {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					}
				},
			}
		);
	});
});


describe("InsightFacade", function() {
	describe("addDataset", function() {
		let sections: string;
		let facade: InsightFacade;

		before(function() {
			sections = getContentFromArchives("small.zip");
		});

		beforeEach(function() {
			// clearDisk();
			facade = new InsightFacade();
		});

		after(function() {
			fs.readdir("./data", (err, files) => {
				if (err) {
					throw err;
				}
				for (const file of files) {
					fs.unlink(path.join("./data", file), (error) => {
						if (error) {
							throw error;
						}
					});
				}
			});
		});

		it("should reject with an empty dataset id", function(){
			const result = facade.addDataset("",sections,InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should add valid dataset", function(){
			const result = facade.addDataset("valid",sections,InsightDatasetKind.Sections);
			return expect(result).to.eventually.deep.equal(["valid"]);
		});

		it("should reject duplicate ids", async function(){
			await facade.addDataset("valid",sections,InsightDatasetKind.Sections);
			const result = facade.addDataset("valid",sections,InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject with rooms kind", function() {
			const result = facade.addDataset("_", sections,InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
	});

	describe("removeDataset", function() {
		let sections: string;
		let facade: InsightFacade;

		before(function() {
			sections = getContentFromArchives("small.zip");
		});
		beforeEach(function() {
			facade = new InsightFacade();
		});
		after(function() {
			fs.readdir("./data", (err, files) => {
				if (err) {
					throw err;
				}
				for (const file of files) {
					fs.unlink(path.join("./data", file), (error) => {
						if (error) {
							throw error;
						}
					});
				}
			});
		});

		it("should remove", async function(){
			await facade.addDataset("valid",sections,InsightDatasetKind.Sections);
			const result = await facade.removeDataset("valid");
			return expect(result).to.deep.equal("valid");
		});

		it("should reject with id not in facade and throw NotFoundError", async function(){
			await facade.addDataset("valid",sections,InsightDatasetKind.Sections);
			try {
				await facade.removeDataset("validd");
				expect.fail("Should have rejected!");
			} catch(err){
				expect(err).to.be.instanceof(NotFoundError);
			}
			// return expect(result).to.eventually.be.rejectedWith(NotFoundError);
		});

		it("should reject with an whitespace", async function(){
			let result = facade.removeDataset("");
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with an whitespace 2", async function(){
			await facade.addDataset("valid",sections,InsightDatasetKind.Sections);
			let result = facade.removeDataset("");
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
	});

	describe("listDatasets", function() {
		let sections: string;
		let facade: InsightFacade;

		before(function() {
			sections = getContentFromArchives("small.zip");
		});

		beforeEach(function() {
			facade = new InsightFacade();
		});
		after(function() {
			fs.readdir("./data", (err, files) => {
				if (err) {
					throw err;
				}
				for (const file of files) {
					fs.unlink(path.join("./data", file), (error) => {
						if (error) {
							throw error;
						}
					});
				}
			});
		});
		it("empty facade", function(){
			const result = facade.listDatasets();
			return expect(result).to.eventually.deep.equal([]);
		});

		it("one dataset in facade", async function(){
			await facade.addDataset("valid",sections,InsightDatasetKind.Sections);
			const result = await facade.listDatasets();
			return expect(result).to.deep.equal([{
				id: "valid",
				kind: InsightDatasetKind.Sections,
				numRows: 1198
			}]);
		});

		it("two dataset in facade", async function(){
			await facade.addDataset("valid",sections,InsightDatasetKind.Sections);
			await facade.addDataset("validtwo",sections,InsightDatasetKind.Sections);
			const result = await facade.listDatasets();
			return expect(result).to.deep.equal([{
				id: "valid",
				kind: InsightDatasetKind.Sections,
				numRows: 1198
			}, {
				id: "validtwo",
				kind: InsightDatasetKind.Sections,
				numRows: 1198
			}]);
		});
	});

	describe("performquery", function () {
		let sections: string;
		let facade: InsightFacade;

		before(async function() {
			// clearDisk();
			sections = getContentFromArchives("pair.zip");
			facade = new InsightFacade();
			await facade.addDataset("sections",sections,InsightDatasetKind.Sections);
		});
		it("should work with query (AND)", async function() {
			const queryAND: unknown = {
				WHERE: {
					AND:[
						{GT:{sections_avg:94.8}},
						{IS:{sections_dept:"cps*"}},
					]
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_id",
						"sections_avg"
					],
					ORDER: "sections_avg",
				}
			};
			const result = await facade.performQuery(queryAND);
			return expect(result).to.deep.equal([
				{sections_dept:"cpsc",sections_id:"589",sections_avg:95},
				{sections_dept:"cpsc",sections_id:"589",sections_avg:95}
			]);
		});
		it("should work with query different section name", async function() {
			const queryAND: unknown = {
				WHERE: {
					AND:[
						{GT:{valid_avg:94.8}},
						{IS:{valid_dept:"cps*"}},
					]
				},
				OPTIONS: {
					COLUMNS: [
						"valid_dept",
						"valid_id",
						"valid_avg"
					],
					ORDER: "valid_avg",
				}
			};
			await facade.addDataset("valid",sections,InsightDatasetKind.Sections);
			const result = await facade.performQuery(queryAND);
			return expect(result).to.deep.equal([
				{valid_dept:"cpsc",valid_id:"589",valid_avg:95},
				{valid_dept:"cpsc",valid_id:"589",valid_avg:95}
			]);
		});

		it("should reject sections_avg:string", async function() {
			const query2: unknown = {
				WHERE: {
					AND:[
						{GT:{sections_avg:"94.8"}},
						{IS:{sections_dept:"cpsc"}}
					]
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_id",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};
			// await facade.addDataset("sections",sections,InsightDatasetKind.Sections);
			try {
				await facade.performQuery(query2);
				expect.fail("Should have rejected!");
			} catch(err) {
				console.log("failed successfully");
				expect(err).to.be.instanceof(InsightError);
			}
		});

		it("should throw ResultTooLargeError", async function() {
			const query3: unknown = {
				WHERE: {
					GT: {
						sections_avg: 50
					}
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_id",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};
			try {
				await facade.performQuery(query3);
				expect.fail("Should have rejected!");
			} catch(err) {
				expect(err).to.be.instanceof(ResultTooLargeError);
			}
		});

		it("should throw ResultTooLargeError for empty where", async function() {
			const query3: unknown = {
				WHERE: {
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_id",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};
			try {
				await facade.performQuery(query3);
				expect.fail("Should have rejected!");
			} catch(err) {
				expect(err).to.be.instanceof(ResultTooLargeError);
			}
		});

		it("should reject because order key is not in column", async function() {
			const query4: unknown = {
				WHERE: {
					OR:[
						{EQ:{sections_avg:94.8}},
						{IS:{sections_dept:"cpsc"}}
					]
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_id",
						"sections_uuid",
						"sections_instructor",
						"sections_title",
						"sections_year",
						"sections_pass",
						"sections_audit",
						"sections_fail"
					],
					ORDER: "sections_avg"
				}
			};
			try {
				await facade.performQuery(query4);
				expect.fail("Should have rejected!");
			} catch(err) {
				expect(err).to.be.instanceof(InsightError);
			}
			// const result = facade.performQuery(query4);
			// return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should work with query OR", async function() {
			const queryOR: unknown = {
				WHERE: {
					OR:[
						{AND:[{IS:{sections_dept: "cpsc"}},
							{LT:{sections_pass: 3}}]},
						{EQ:{sections_avg:94.8}}
					]
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg",
						"sections_year",
						"sections_pass",
						"sections_audit",
						"sections_fail"
					],
					ORDER: "sections_avg"
				}
			};
			const result = await facade.performQuery(queryOR);
			const expected: InsightResult[] = [
				{sections_dept:"cpsc",sections_avg:75,sections_year:2012,sections_pass:1,sections_audit:0,
					sections_fail:0},
				{sections_dept:"cpsc",sections_avg:80,sections_year:1900,sections_pass:2,sections_audit:0,
					sections_fail:0},
				{sections_dept:"cpsc",sections_avg:80,sections_year:2009,sections_pass:2,sections_audit:0,
					sections_fail:0},
				{sections_dept:"cpsc",sections_avg:85,sections_year:2015,sections_pass:1,sections_audit:0,
					sections_fail:0},
				{sections_dept:"cpsc",sections_avg:86.5,sections_year:1900,sections_pass:2,sections_audit:0,
					sections_fail:0},
				{sections_dept:"cpsc",sections_avg:87,sections_year:1900,sections_pass:1,sections_audit:0,
					sections_fail:0},
				{sections_dept:"cpsc",sections_avg:87,sections_year:2013,sections_pass:1,sections_audit:0,
					sections_fail:0},
				{sections_dept:"epse",sections_avg:94.8,sections_year:2010,sections_pass:5,sections_audit:0,
					sections_fail:0},
				{sections_dept:"cpsc",sections_avg:95,sections_year:1900,sections_pass:1,sections_audit:0,
					sections_fail:0},
				{sections_dept:"cpsc",sections_avg:95,sections_year:2014,sections_pass:1,sections_audit:0,
					sections_fail:0}
			];
			expect(result[0]).to.deep.equal(expected[0]);
			expect(result[3]).to.deep.equal(expected[3]);
			expect(result[4]).to.deep.equal(expected[4]);
			expect(result[7]).to.deep.equal(expected[7]);
			return expect(result).to.have.deep.members(expected);
		});

		it("should work with double negation", async function() {
			const query6: unknown = {
				WHERE: {
					NOT: {NOT: {IS: {sections_instructor: "kiczales, gregor"}}}
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_id",
						"sections_year",
						"sections_avg"
					],
					ORDER: "sections_year"
				}
			};
			const result = await facade.performQuery(query6);
			const expected: InsightResult[] = [
				{sections_dept:"cpsc",sections_id:"110",sections_year:2009,sections_avg:72.58},
				{sections_dept:"cpsc",sections_id:"110",sections_year:2009,sections_avg:71.4},
				{sections_dept:"cpsc",sections_id:"110",sections_year:2010,sections_avg:76.98},
				{sections_dept:"cpsc",sections_id:"110",sections_year:2010,sections_avg:70.75},
				{sections_dept:"cpsc",sections_id:"110",sections_year:2011,sections_avg:77.11},
				{sections_dept:"cpsc",sections_id:"110",sections_year:2011,sections_avg:73.53},
				{sections_dept:"cpsc",sections_id:"110",sections_year:2011,sections_avg:77.69},
				{sections_dept:"cpsc",sections_id:"110",sections_year:2012,sections_avg:74.24},
				{sections_dept:"cpsc",sections_id:"110",sections_year:2012,sections_avg:77.43},
				{sections_dept:"cpsc",sections_id:"110",sections_year:2013,sections_avg:70.11},
				{sections_dept:"cpsc",sections_id:"110",sections_year:2014,sections_avg:85.11},
				{sections_dept:"cpsc",sections_id:"110",sections_year:2014,sections_avg:73.13},
				{sections_dept:"cpsc",sections_id:"110",sections_year:2014,sections_avg:71.07},
				{sections_dept:"cpsc",sections_id:"110",sections_year:2015,sections_avg:84.91},
				{sections_dept:"cpsc",sections_id:"110",sections_year:2015,sections_avg:70.78}
			];
			expect(result[9]).to.deep.equal(expected[9]);
			return expect(result).to.have.deep.members(expected);

		});
		it("should work with object", async function() {
			const queryObject: unknown = {
				WHERE: {
					IS: {
						sections_dept: "zool"
					}
				},
				OPTIONS: {
					COLUMNS: [
						"sections_id",
						"sections_year",
						"sections_avg"
					],
					ORDER: {
						dir: "UP",
						keys: [
							"sections_avg"
						]
					}
				}
			};
			const result = await facade.performQuery(queryObject);
			const expected: InsightResult[] = [
				{sections_id: "549", sections_year: 2010,sections_avg: 83.67},
				{sections_id: "549",sections_year: 1900,sections_avg: 85},
				{sections_id: "549",sections_year: 2008,sections_avg: 85},
				{sections_id: "503",sections_year: 2012,sections_avg: 86.25},
				{sections_id: "503",sections_year: 1900,sections_avg: 86.25},
				{sections_id: "549",sections_year: 2008,sections_avg: 86.8},
				{sections_id: "549",sections_year: 2010,sections_avg: 87},
				{sections_id: "549",sections_year: 2011,sections_avg: 87.14},
				{sections_id: "549",sections_year: 1900,sections_avg: 87.2},
				{sections_id: "549", sections_year: 1900, sections_avg: 87.7},
				{sections_id: "549", sections_year: 1900, sections_avg: 87.75},
				{sections_id: "549", sections_year: 1900, sections_avg: 88.08},
				{sections_id: "549", sections_year: 2010, sections_avg: 88.67},
				{sections_id: "549", sections_year: 2009, sections_avg: 88.75},
				{sections_id: "549", sections_year: 2008, sections_avg: 88.88},
				{sections_id: "549", sections_year: 2011, sections_avg: 89},
				{sections_id: "549", sections_year: 2010, sections_avg: 89},
				{sections_id: "549", sections_year: 2009, sections_avg: 89.17},
				{sections_id: "549", sections_year: 1900, sections_avg: 89.27},
				{sections_id: "503", sections_year: 2011, sections_avg: 89.45},
				{sections_id: "503", sections_year: 1900, sections_avg: 89.45},
				{sections_id: "503", sections_year: 2014, sections_avg: 89.5},
				{sections_id: "503", sections_year: 1900, sections_avg: 89.5},
				{sections_id: "503", sections_year: 2009, sections_avg: 89.56},
				{sections_id: "503", sections_year: 1900, sections_avg: 89.56},
				{sections_id: "549", sections_year: 1900, sections_avg: 89.57},
				{sections_id: "549", sections_year: 2009, sections_avg: 90.2},
				{sections_id: "503", sections_year: 2015, sections_avg: 90.45},
				{sections_id: "503", sections_year: 1900, sections_avg: 90.45},
				{sections_id: "549", sections_year: 2011, sections_avg: 91.67},
				{sections_id: "549", sections_year: 1900, sections_avg: 91.67},
				{sections_id: "549", sections_year: 2009, sections_avg: 92},
				{sections_id: "503", sections_year: 2013, sections_avg: 92.1},
				{sections_id: "503", sections_year: 1900, sections_avg: 92.1},
				{sections_id: "503", sections_year: 2008, sections_avg: 92.71},
				{sections_id: "503", sections_year: 1900, sections_avg: 92.71}
			];
			expect(result[0]).to.deep.equal(expected[0]);
			return expect(result).to.deep.equal(expected);

		});
		it("tests wildcards", async function() {
			const query7: unknown = {
				WHERE: {
					AND :[
						{AND:[{LT:{sections_avg: 89.5}},
							{GT:{sections_avg: 89}}]},
						{OR:[{IS:{sections_dept:"*nj"}},
							{IS:{sections_dept:"z*"}}]}
					]
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_id",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};
			const result = await facade.performQuery(query7);
			const expected: InsightResult[] = [
				{sections_dept:"punj",sections_id:"102",sections_avg:89.08},
				{sections_dept:"punj",sections_id:"102",sections_avg:89.08},
				{sections_dept:"zool",sections_id:"549",sections_avg:89.17},
				{sections_dept:"zool",sections_id:"549",sections_avg:89.27},
				{sections_dept:"zool",sections_id:"503",sections_avg:89.45},
				{sections_dept:"zool",sections_id:"503",sections_avg:89.45}
			];
			expect(result[2]).to.deep.equal(expected[2]);
			expect(result[3]).to.deep.equal(expected[3]);
			return expect(result).to.have.deep.members(expected);
		});
		it("tests invalid wildcards", async function() {
			const query7: unknown = {
				WHERE: {
					AND :[
						{AND:[{LT:{sections_avg: 89.5}},
							{GT:{sections_avg: 89}}]},
						{OR:[{IS:{sections_dept:"**nj*"}},
							{IS:{sections_dept:"z*"}}]}
					]
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_id",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};
			try {
				await facade.performQuery(query7);
				expect.fail("Should have rejected!");
			} catch(err) {
				expect(err).to.be.instanceof(InsightError);
			}
		});

	});
});
