import dotenv from 'dotenv';

dotenv.config();

export class EnvironmentService {
    static getMongoBaseUri(): string {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.log('[DEBUG environment.service.ts] entire env =', process.env);
            console.log('[DEBUG environment.service.ts] MONGODB_URI =', process.env.MONGODB_URI);
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
