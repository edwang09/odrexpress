import nextConnect from 'next-connect';
import database from './database';

const handler = nextConnect();

handler.use(database);


//stage 1 for room creation
handler.post(async (req, res) => {
    const {negotiationid, party} = req.body
    let counterparty
    switch (party) {
        case "convey":
            counterparty = "receive"
            break;
        case "receive":
            counterparty = "convey"
            break;
    }
    if (negotiationid && negotiationid!=="" && counterparty){
        const result = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
        res.json({...result, [counterparty]: {...result[counterparty], considerationlist:undefined}});
    }else{
        res.status(400).json({error: "negotiationid and party is required"});
    }
});

export default handler;