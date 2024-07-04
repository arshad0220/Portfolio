import { DataAPIClient } from "@datastax/astra-db-ts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";
import OpenAI from "openai";
import ArshadData from "./ArshadData.json" with { type: "json" };

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY
});

console.log("ASTRA_DB_APPLICATION_TOKEN:", process.env.ASTRA_DB_APPLICATION_TOKEN);
console.log("ASTRA_DB_API_ENDPOINT:", process.env.ASTRA_DB_API_ENDPOINT);
console.log("ASTRA_DB_NAMESPACE:", process.env.ASTRA_DB_NAMESPACE);

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(process.env.ASTRA_DB_API_ENDPOINT, {
    namespace: process.env.ASTRA_DB_NAMESPACE
});

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
});

const createCollection = async () => {
    try {
        await db.createCollection("portfolio", {
            vector: {
                dimension: 1536,
            }
        });
    } catch (error) {
        console.log("Collection Already Exists", error);
    }
};

const loadData = async () => {
    const collection = await db.collection("portfolio");

    for await (const { id, info, description } of ArshadData) {
        let descriptions = [];

        if (typeof description === 'string') {
            descriptions.push(description);
        } else if (Array.isArray(description)) {
            description.forEach(item => {
                if (typeof item === 'string') {
                    descriptions.push(item);
                } else if (typeof item === 'object') {
                    Object.values(item).forEach(value => {
                        if (typeof value === 'string') {
                            descriptions.push(value);
                        } else if (Array.isArray(value)) {
                            descriptions.push(...value);
                        }
                    });
                }
            });
        }

        for await (const desc of descriptions) {
            const chunks = await splitter.splitText(desc);
            let i = 0;

            for await (const chunk of chunks) {
                const { data } = await openai.embeddings.create({
                    input: chunk,
                    model: "text-embedding-3-small"
                });

                const res = await collection.insertOne({
                    document_id: id,
                    $vector: data[0]?.embedding,
                    info,
                    description: chunk
                });

                i++;
            }
        }
    }

    console.log("data added");
};

createCollection().then(loadData).catch(console.error);
