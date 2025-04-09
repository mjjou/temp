import dotenv from 'dotenv';

dotenv.config();

export class EnvironmentService {
    static getMongoBaseUri(): string {
        const uri = process.env.MONGODB_URL;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in the environment variables.');
        }
        return uri;
    }

    // static getMongoUri(): string {
    //     return this.getMongoBaseUri();
    // }

    static getChatDbName(): string {
        const dbName = process.env.CHAT_DB_NAME;
        if (!dbName) {
            throw new Error('CHAT_DB_NAME is not defined in the environment variables.');
        }
        return dbName;
    }
}
