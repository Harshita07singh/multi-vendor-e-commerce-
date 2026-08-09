import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("Missing MONGO_URI in environment.");
    process.exit(1);
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    retryWrites: true,
    maxPoolSize: 10,
    minPoolSize: 2,
  });

  try {
    const db = mongoose.connection.db;
    const collection = db.collection("subcategories");

    const indexes = await collection.indexes();
    const old = indexes.find(
      (i) =>
        i.unique === true &&
        i.key?.name === 1 &&
        i.key?.category === 1 &&
        Object.keys(i.key || {}).length === 2,
    );

    if (old?.name) {
      console.log(`Dropping old index: ${old.name}`);
      await collection.dropIndex(old.name);
    } else {
      console.log("Old { name, category } unique index not found (ok).");
    }

    console.log("Ensuring new unique index { vendor, category, slug } …");
    await collection.createIndex(
      { vendor: 1, category: 1, slug: 1 },
      { unique: true, name: "vendor_1_category_1_slug_1" },
    );

    console.log("Done.");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

