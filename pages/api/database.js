import { MongoClient } from 'mongodb';
import nextConnect from 'next-connect';
const client = new MongoClient('mongodb+srv://admin:ti21sNLGy1NuJ5s1@cluster0-8fgyu.mongodb.net/test?retryWrites=true&w=majority', {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
async function database(req, res, next) {
  if (!client.isConnected()) {
    await client.connect()
  };
  req.dbClient = client;
  req.db = client.db('odrexpress');
  return next();
}

const middleware = nextConnect();
middleware.use(database);
export default database;