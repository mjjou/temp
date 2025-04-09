import { MongoClient, ServerApiVersion } from 'mongodb';
import { EnvironmentService } from '../environment/environment.service.js';

export async function createChatMongoConnection() {
    const uri = EnvironmentService.getMongoBaseUri();
    const dbName = EnvironmentService.getChatDbName();

    // Create MongoClient instance
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    try {
        // Connect to the server
        await client.connect();
        // Get the specific database
        const db = client.db(dbName);
        // Send ping command to confirm successful connection
        await db.command({ ping: 1 });
        console.log(`Connected to MongoDB database: ${dbName}`);
        return { client, db };
    } catch (error) {
        console.error(`Failed to connect to MongoDB database: ${dbName}`, error);
        await client.close();
        throw error;
    }
}