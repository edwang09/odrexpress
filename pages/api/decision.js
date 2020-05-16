import nextConnect from 'next-connect';
import database from './database';

const handler = nextConnect();

handler.use(database);


//stage 1 for room creation
handler.post(async (req, res) => {
    const {negotiationid, conveydecision, receivedecision} = req.body
    if (negotiationid && negotiationid!==""){
        console.log(req.body)
        let updatedoc = {}
        if (conveydecision) updatedoc = {...updatedoc, conveydecision}
        if (receivedecision) updatedoc = {...updatedoc, receivedecision}
        console.log(updatedoc)
        await req.db.collection('negotiation').updateOne(
            {'negotiationid': negotiationid},[{ $set: updatedoc }])
        const result = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
        if(result.conveydecision &&result.receivedecision ){
             await req.db.collection('negotiation').updateOne(
                {'negotiationid': negotiationid}, [
                    { $set: {stage:4, result: (
                        (result.conveydecision==="accept" && result.receivedecision==="accept") ? "accept" : "reject" )} }
                ])
            const response = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
            res.json(response);
        }else{
            res.json(result);
        }
    }else{
        res.json({error: "failed"});
    }
});

export default handler;