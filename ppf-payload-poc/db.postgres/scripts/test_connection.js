const { Client } = require('pg');
const { VisualStudioCodeCredential, DefaultAzureCredential, AzureDeveloperCliCredential, ChainedTokenCredential } = require("@azure/identity")
require('dotenv').config();


async function getAccessToken() {
    const credential = new ChainedTokenCredential(
        new AzureDeveloperCliCredential(),
        new VisualStudioCodeCredential(),
        new DefaultAzureCredential()
    );
    const token = await credential.getToken("https://ossrdbms-aad.database.windows.net");
    return token.token;
}

async function getClient() {
    const connectionString = process.env.DATABASE_URL;
    const connection = !connectionString ? {
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        port: Number(process.env.PGPORT),
        password: process.env.PGPASSWORD ? process.env.PGPASSWORD : getAccessToken,
        database: process.env.PGDATABASE,
    } : {
        connectionString: connectionString
    }
    const config = {
        ...connection,
        ssl: {
            rejectUnauthorized: false
        }
    }
    console.log("PostgreSQL Config", config)
    return new Client({
        ...config
    });
}

async function testConnection() {
    const client = await getClient()
    try {
        await client.connect();
        console.log('PostgreSQL Connection successful');
        console.log("PostgreSQL Test Completed");
    } catch (err) {
        console.error('PostgreSQL Connection failed:', err);
    } finally {
        await client.end();
    }
}

testConnection();
