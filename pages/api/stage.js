import nextConnect from 'next-connect';
import database from './database';
const handler = nextConnect();
handler.use(database);


handler.post(async (req, res) => {
    const {negotiationid} = req.body
    if (negotiationid && negotiationid!==""){
        try{
            await req.db.collection('negotiation').updateOne({'negotiationid': negotiationid}, [ { $set: {stage:1} } ])
            const result = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
            res.json(result);
        }catch(error){
            res.status(400).json({error:"unable to make post request", detail: error});
        }
    }else{
        res.status(400).json({error: "please provide parameters"});
    }
});

export default handler;