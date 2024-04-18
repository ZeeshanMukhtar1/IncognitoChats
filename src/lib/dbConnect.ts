import mongoose from 'mongoose';

type connectionObject = {
  isConnected?: number;
};

const connection: connectionObject = {};

async function dbConnect(): Promise<void> {
  // optimization to avoid multiple connections so that it does not hit the DB performance 😑
  if (connection.isConnected) {
    console.log('DB is already connected');
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || '', {});
    connection.isConnected = db.connections[0].readyState;
    console.log('DB connected successfully to:', db.connections[0].name);
    console.log(db);
    console.log(db.connections);
    console.log(db.connections[0].readyState);
  } catch (error) {
    console.log('DB connection failed  :', error);
    process.exit(1); // gracefully exit the Node.js process
  }
}

export default dbConnect;
