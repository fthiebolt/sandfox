import { connect, ConnectionOptions, set } from "mongoose";

export class Database {
	constructor(public uri: string = process.env.MONGO_URL || 'localhost') {
	}
	public async connect(options: ConnectionOptions = {}) {
		set('useFindAndModify', false);
		await connect(this.uri, options);
		console.log('Connected to the database'.green);
	}
}