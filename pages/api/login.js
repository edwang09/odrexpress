import nextConnect from 'next-connect';
import database from './database';
const crypto = require('crypto');
const handler = nextConnect();
const salt = process.env.SALT;
handler.use(database);


handler.post(async (req, res) => {
    const {username, password} = req.body
    if (username && password){
        try {
            const hashedpassword =  crypto.scryptSync(password, salt, 64).toString('hex');
            const result = await req.db.collection('users').findOne({username, hashedpassword})
            if (result){
                return res.json(result);
            }else{
                return res.status(401).json({error: "username or password incorrect"});
            }
        } catch (error) {
            res.status(400).json({error:"unable to make request", detail: error});
        }
    }else{
        res.status(400).json({error: "please provide username and password"});
    }
});

export default handler;