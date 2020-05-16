import nextConnect from 'next-connect';
import database from './database';

const handler = nextConnect();

handler.use(database);


//stage 1 for room creation
handler.post(async (req, res) => {
    const {negotiationid} = req.body
    if (negotiationid && negotiationid!==""){
        const result = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
        res.json(result);
    }else{
        res.json({error: "failed"});
    }
});

export default handler;