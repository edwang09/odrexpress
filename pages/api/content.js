import nextConnect from 'next-connect';
import database from './database';
import fs from 'fs'
import path from 'path'
const handler = nextConnect();
const postsDirectory = path.join(process.cwd(), 'admin')
const salt = "rustylake"
handler.use(database);
const crypto = require('crypto');


//stage 1 for room creation
handler.post(async (req, res) => {
    const {page, content, username, password} = req.body
    if (username && password){
        const hashedpassword =  crypto.scryptSync(password, salt, 64).toString('hex');
        const result = await req.db.collection('users').findOne({username, hashedpassword})
        if (result){
            if (page && content){
                try {
                    const fullPath = path.join(postsDirectory, page)
                    const fileContents = fs.writeFileSync(fullPath, content)
                    res.json("succeed");
                } catch (error) {
                    res.json("failed");
                }
            }
        }else{
            return res.json({error: "username or password incorrect"});
        }
    }else{
        res.json({error: "please provide username and password"});
    }
});


handler.get(async (req, res) => {
    const { page } = req.query
    if (page && page!==""){
        try {
        const fullPath = path.join(process.cwd(), 'admin', page)
        const fileContents = fs.readFileSync(fullPath, "utf8")
            res.json({result: "succeed", content: fileContents});
        } catch (error) {
            console.log(error)
            res.json({result: "failed",  error});
        }
    }
    res.json(req.query);
});


export default handler;