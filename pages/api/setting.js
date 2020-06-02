import nextConnect from 'next-connect';
import database from './database';
const handler = nextConnect();
const salt = "rustylake"
handler.use(database);
const crypto = require('crypto');

handler.post(async (req, res) => {
    const {currency, username, password, setting} = req.body
    if (currency && username && password){
        const hashedpassword =  crypto.scryptSync(password, salt, 64).toString('hex');
        const result = await req.db.collection('users').findOne({username, hashedpassword})
        if (result){
            try {
                const modify = await req.db.collection('setting').updateOne({},[ { $set: {currency} } ])
                res.json(modify);
            } catch (error) {
                res.status(400).json({error:"unable to update currency list", detail: error});
            }
        }else{
            return res.status(401).json({error: "username or password incorrect"});
        }
    }else if (setting && username && password){
        const hashedpassword =  crypto.scryptSync(password, salt, 64).toString('hex');
        const result = await req.db.collection('users').findOne({username, hashedpassword})
        if (result){
            try {
                const modify = await req.db.collection('setting').updateOne({},[ { $set: {setting} } ])
                res.json(modify);
            } catch (error) {
                res.status(400).json({error:"unable to update setting", detail: error});
            }
        }else{
            return res.status(401).json({error: "username or password incorrect"});
        }

    }else{
        res.status(401).json({error: "please provide username and password"});

    }
});

handler.get(async (req, res) => {
    try {
        const setting = (await req.db.collection('setting').findOne())
        res.json({result: "succeed", setting});
    } catch (error) {
        res.status(400).json({error: "unable to retreive currency list",  detail: error});
    }
});


export default handler;