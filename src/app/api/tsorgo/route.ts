import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// POST
export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const data = {
        utas: formData.get('utas'),
        khayg: formData.get('khayg'),
        createdAt: new Date(),
    };

    const client = await MongoClient.connect(process.env.MONGO!);
    const db = client.db();
    const collection = db.collection('tsorgo');

    const result = await collection.insertOne(data);
    client.close();

    return NextResponse.json({ success: true, insertedId: result.insertedId});
}

//GET
export async function GET() {
    const client = await MongoClient.connect(process.env.MONGO!);
    const db = client.db();
    const collection = db.collection('tsorgo');

    const list = await collection.find().sort({ createdAt: -1 }).toArray();
    client.close();
    
    const cleaned = list.map((item) => ({
        ...item,
        _id: item._id.toString(),
    }));

    return NextResponse.json(cleaned);
}