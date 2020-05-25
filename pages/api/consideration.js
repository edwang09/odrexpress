import nextConnect from 'next-connect';
import database from './database';
const handler = nextConnect();
handler.use(database);

handler.post(async (req, res) => {
    const {negotiationid, receive, convey} = req.body
    if (negotiationid && negotiationid!==""){
        let updatedoc = {stage: 2}
        if (receive) updatedoc = {...updatedoc, receiveconsideration: true , receive}
        if (convey) updatedoc = {...updatedoc, conveyconsideration: true , convey}
        try {
            await req.db.collection('negotiation').updateOne({'negotiationid': negotiationid}, [ { $set: updatedoc }])
            let result = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
            if (result.receiveconsideration && result.conveyconsideration){        
                const final =  getfinal(result.convey.considerationlist, result.receive.considerationlist, result.convey.conveyprice, result.convey.receiveprice)
                await req.db.collection('negotiation').updateOne({'negotiationid': negotiationid}, [{ $set: {stage: 3, final, finaltime: Date.now()} } ] )
                result = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
            }
            res.json(result);
        } catch (error) {
            res.status(400).json({error:"unable to make post request", detail: error});
        }
    }else{
        res.status(400).json({error:"negotiationid is required", detail: error});
    }
});


const getfinal = (convey, receive, conveyprice, receiveprice) =>{
    const ConveyModifier = [0.03, 0.05, 0.07, 0.09]
    const ReceiveModifier = [-0.08,-0.06, -0.04, -0.02]
    let base = 42
    console.log("getfinal")
    console.log(convey)
    convey.map(convey=>{
        console.log(convey.choice)
        console.log(base)
        base += ConveyModifier[parseInt(convey.choice)]
    })
    receive.map(receive=>{
        console.log(receive.choice)
        console.log(base)
        base += ReceiveModifier[parseInt(receive.choice)]
    })
    return Math.round(receiveprice - (receiveprice-conveyprice)*base/100)
}

export default handler;