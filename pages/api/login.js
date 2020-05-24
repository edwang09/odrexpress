import nextConnect from 'next-connect';
import database from './database';
const crypto = require('crypto');
const handler = nextConnect();
const salt = "rustylake"
handler.use(database);


//stage 1 for room creation
handler.post(async (req, res) => {
    const {username, password} = req.body
    if (username && password){
        const hashedpassword =  crypto.scryptSync(password, salt, 64).toString('hex');
        console.log()
        const result = await req.db.collection('users').findOne({username, hashedpassword})
        if (result){
            return res.json(result);
        }else{
            return res.json({error: "username or password incorrect"});
        }
    }else{
        res.json({error: "please provide username and password"});
    }
});

export default handler;