import nextConnect from 'next-connect';
import database from './database';

const handler = nextConnect();

handler.use(database);
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

//stage 1 for room creation
handler.post(async (req, res) => {
    const {negotiationid, receive, convey} = req.body
    if (negotiationid && negotiationid!==""){
        let updatedoc = {stage: 2}
        if (receive) updatedoc = {...updatedoc, receiveconsideration: true , receive}
        if (convey) updatedoc = {...updatedoc, conveyconsideration: true , convey}
        // console.log(updatedoc)

        let doc = await req.db.collection('negotiation').updateOne(
            {'negotiationid': negotiationid},
            [
                { $set: updatedoc }
            ]
        )
        const result = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})

        if (result.receiveconsideration && result.conveyconsideration){        
            console.log(result)
            const final =  getfinal(result.convey.considerationlist, result.receive.considerationlist, result.convey.conveyprice, result.convey.receiveprice)
            console.log(final)
            await req.db.collection('negotiation').updateOne({'negotiationid': negotiationid},
                [
                    { $set: {stage: 3, final, finaltime: Date.now()} }
                ]
            )
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