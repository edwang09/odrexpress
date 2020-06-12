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
                const setting =(await req.db.collection('setting').findOne()).setting   
                const final =  getfinal(setting, result.convey.considerationlist, result.receive.considerationlist, result.convey.conveyprice, result.convey.receiveprice)
                console.log(final)
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


const getfinal = (setting, convey, receive, conveyprice, receiveprice) =>{
    const ConveyModifier = [setting.convey1, setting.convey2, setting.convey3, setting.convey4]
    const ReceiveModifier = [setting.receive1, setting.receive2, setting.receive3, setting.receive4]
    const FM = (Math.random() * (setting.finalmultiplierupper -  setting.finalmultiplierlower) + setting.finalmultiplierlower)/100
    let base = parseFloat(setting.initial)
    convey.map(convey=>{
        base += parseFloat(ConveyModifier[parseInt(convey.choice)])
    })
    receive.map(receive=>{
        console.log(receive.choice)
        base += parseFloat(ReceiveModifier[parseInt(receive.choice)])
    })
    return Math.round((receiveprice - (receiveprice-conveyprice)*base/100)*FM)
}

export default handler;