import express, {Application, Request, Response} from "express";
import * as http from "http";
import cors from "cors";
import InsightFacade from "../controller/InsightFacade";
import {IInsightFacade, InsightDatasetKind, InsightError, NotFoundError} from "../controller/IInsightFacade";

export default class Server {
	private readonly port: number;
	private express: Application;
	private server: http.Server | undefined;
	private facade: IInsightFacade = new InsightFacade();

	constructor(port: number) {
		console.info(`Server::<init>( ${port} )`);
		this.port = port;
		this.express = express();

		this.registerMiddleware();
		this.registerRoutes();

		/** NOTE: you can serve static frontend files in from your express server
		 * by uncommenting the line below. This makes files in ./frontend/public
		 * accessible at http://localhost:<port>/
		 */
		// this.express.use(express.static("./frontend/public"))
	}

	/**
	 * Starts the server. Returns a promise that resolves if success. Promises are used
	 * here because starting the server takes some time and we want to know when it
	 * is done (and if it worked).
	 *
	 * @returns {Promise<void>}
	 */
	public start(): Promise<void> {
		return new Promise((resolve, reject) => {
			console.info("Server::start() - start");
			if (this.server !== undefined) {
				console.error("Server::start() - server already listening");
				reject();
			} else {
				this.server = this.express.listen(this.port, () => {
					console.info(`Server::start() - server listening on port: ${this.port}`);
					resolve();
				}).on("error", (err: Error) => {
					// catches errors in server start
					console.error(`Server::start() - server ERROR: ${err.message}`);
					reject(err);
				});
			}
		});
	}

	/**
	 * Stops the server. Again returns a promise so we know when the connections have
	 * actually been fully closed and the port has been released.
	 *
	 * @returns {Promise<void>}
	 */
	public stop(): Promise<void> {
		console.info("Server::stop()");
		return new Promise((resolve, reject) => {
			if (this.server === undefined) {
				console.error("Server::stop() - ERROR: server not started");
				reject();
			} else {
				this.server.close(() => {
					console.info("Server::stop() - server closed");
					resolve();
				});
			}
		});
	}

	public getExpress(): Application {
		return this.express;
	}

	// Registers middleware to parse request before passing them to request handlers
	private registerMiddleware() {
		// JSON parser must be place before raw parser because of wildcard matching done by raw parser below
		this.express.use(express.json());
		this.express.use(express.raw({type: "application/*", limit: "10mb"}));

		// enable cors in request headers to allow cross-origin HTTP requests
		this.express.use(cors());
	}

	private getDataset(get: string) {
		this.express.get(get, (req,res) => {
			this.facade.listDatasets()
				.then((value) => {
					res.status(200);
					res.send(value);
				})
				.catch((err) => {
					res.status(400);
					res.send("listDataset failed");
				});
		});
	}

	private deleteDataset(deleted: string) {
		this.express.delete(deleted, (req, res) => {
			if (!req.params.id) {
				res.status(400);
				res.send("Invalid id");
			}
			this.facade.removeDataset(req.params.id)
				.then((value) => {
					res.status(200);
					res.send(value);
				})
				.catch((err) => {
					if (err instanceof NotFoundError) {
						res.status(404);
						res.send("dataset with given ID not found");
					} else {
						res.status(400);
						res.send("listDataset failed");
					}
				});
		});
		return;
	}

	private putDataset(put: string) {
		this.express.put(put, (req, res) => {
			let kind: InsightDatasetKind;
			let content: string;
			if (!req.params.id) {
				res.status(400);
				res.send("Invalid id");
			}
			if (req.params.kind === "sections") {
				kind = InsightDatasetKind.Sections;
			} else if (req.params.kind === "rooms") {
				kind = InsightDatasetKind.Rooms;
			} else {
				kind = InsightDatasetKind.Rooms;
				res.status(400);
				res.send("Invalid data kind");
			}
			content = Buffer.from(req.body, "binary").toString("base64");
			this.facade.addDataset(req.params.id, content, kind)
				.then((value) => {
					res.status(200);
					res.send(value);
					// res.send(req.params.id);
				})
				.catch((err) => {
					res.status(400);
					res.send("addDataset failed");
				});
		});
		return;
	}

	private postQuery(post: string) {
		this.express.post(post, (req, res) => {
			this.facade.performQuery(req.body)
				.then((value) => {
					res.status(200);
					res.send(value);
				})
				.catch((err) => {
					res.status(400);
					res.send("performQuery failed");
				});
		});
	}

	// Registers all request handlers to routes
	private registerRoutes() {
		// This is an example endpoint this you can invoke by accessing this URL in your browser:
		// http://localhost:4321/echo/hello
		this.express.get("/echo/:msg", Server.echo);

		// TODO: your other endpoints should go here
		this.express.get("/", (req, res) => {
			res.send("Hello World!");
		});
		this.getDataset("/dataset");
		this.deleteDataset("/dataset/:id");
		this.putDataset("/dataset/:id/:kind");
		this.postQuery("/query");
	}

	/**
	 * The next two methods handle the echo service.
	 * These are almost certainly not the best place to put these, but are here for your reference.
	 * By updating the Server.echo function pointer above, these methods can be easily moved.
	 */
	private static echo(req: Request, res: Response) {
		try {
			console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
			const response = Server.performEcho(req.params.msg);
			res.status(200).json({result: response});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}

	private static performEcho(msg: string): string {
		if (typeof msg !== "undefined" && msg !== null) {
			return `${msg}...${msg}`;
		} else {
			return "Message not provided";
		}
	}
}
