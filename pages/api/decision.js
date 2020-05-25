import nextConnect from 'next-connect';
import database from './database';
const handler = nextConnect();
handler.use(database);

handler.post(async (req, res) => {
    const {negotiationid, conveydecision, receivedecision} = req.body
    if (negotiationid && negotiationid!==""){
        let updatedoc = {}
        if (conveydecision) updatedoc = {...updatedoc, conveydecision}
        if (receivedecision) updatedoc = {...updatedoc, receivedecision}
        try {
            await req.db.collection('negotiation').updateOne({'negotiationid': negotiationid},[{ $set: updatedoc }])
            let result = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
            if(result.conveydecision && result.receivedecision){
                await req.db.collection('negotiation').updateOne({'negotiationid': negotiationid}, [{ $set: {stage:4, result: (
                    (result.conveydecision==="accept" && result.receivedecision==="accept") ? "accept" : "reject" 
                    )} 
                    }])
                result = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
            }
            res.json(result);
        } catch (error) {
            res.status(400).json({error:"unable to make post request", detail: error});
        }
    }else{
        res.status(400).json({error: "please provide negotiationid"});
    }
});

export default handler;