import nextConnect from 'next-connect';
import database from './database';
const handler = nextConnect();
const salt = "rustylake"
handler.use(database);
const crypto = require('crypto');
// import fs from 'fs'
// import path from 'path'
// const postsDirectory = path.join(process.cwd(), 'admin')

handler.post(async (req, res) => {
    const {page, content, username, password} = req.body
    if (username && password && page && content){
        const hashedpassword =  crypto.scryptSync(password, salt, 64).toString('hex');
        const result = await req.db.collection('users').findOne({username, hashedpassword})
        if (result){
            try {
                await req.db.collection('content').updateOne({name:page}, [ { $set: {content} } ])
                res.json({result:"succeed"});
            } catch (error) {
                res.status(400).json({result:"unable to make post request", error});
            }
        }else{
            res.status(401).json({error: "username or password incorrect"});
        }
    }else{
        res.status(400).json({error: "please provide username, password, page and content"});
    }
});


handler.get(async (req, res) => {
    const { page } = req.query
    if (page && page!==""){
        try {
            // const fullPath = path.join(process.cwd(),page)
            // const fileContents = fs.readFileSync(fullPath, "utf8")
            const content = (await req.db.collection('content').findOne({name:page})).content
            res.json({result: "succeed", content});
        } catch (error) {
            res.status(400).json({result:"unable to make request", error});
        }
    }
    res.status(400).json({error: "please provide parameter"});
});


export default handler;