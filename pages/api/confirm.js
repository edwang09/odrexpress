import nextConnect from 'next-connect';
import database from './database';

const handler = nextConnect();

handler.use(database);


handler.post(async (req, res) => {
    const {negotiationid, party} = req.body
    
    if (negotiationid && negotiationid!==""){
        const result = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
        if (result.confirmed){
            res.json(result)
        }else{
            const confirmed = (result.convey && result.convey.conveyprice && result.convey.receiveprice && result.convey.currency && 
                result.receive && result.receive.conveyprice && result.receive.receiveprice && result.receive.currency && 
                result.convey.conveyprice === result.receive.conveyprice &&
                result.convey.receiveprice === result.receive.receiveprice &&
                result.convey.currency === result.receive.currency
            )
            // const unconfirmedfield = getUnconfirmedfield(result)
            const confirmtime= Date.now()
            await req.db.collection('negotiation').updateOne({'negotiationid': negotiationid}, [ { $set: {confirmed, confirmtime} } ]) 
            res.json({...result, confirmed, confirmtime});
        }
    }else{
        res.status(400).json({error: "negotiationid and party is required"});
    }
});


export default handler;