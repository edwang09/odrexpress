import { MongoClient } from 'mongodb';
import nextConnect from 'next-connect';

const client = new MongoClient('mongodb+srv://admin:KvUXFD86PEsCKZSg@cluster0-8fgyu.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function database(req, res, next) {
  if (!client.isConnected()) await client.connect();
  req.dbClient = client;
  req.db = client.db('odrexpress');
  return next();
}

const middleware = nextConnect();

middleware.use(database);

export default database;