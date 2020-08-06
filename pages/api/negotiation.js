import nextConnect from 'next-connect';
import database from './database';
const handler = nextConnect();
handler.use(database);


handler.post(async (req, res) => {
    const {negotiationid, party, receive, convey} = req.body
    if(party === "convey" && convey && convey.conveyprice && convey.receiveprice && convey.timed && convey.currency ){
        console.log(req.body)
        let newnegotiationid
        let exist
        do {
            newnegotiationid = makeid()
            exist = await req.db.collection('negotiation').findOne({'negotiationid': newnegotiationid})
        } while (exist);

        //initialize considerationlist into created negotiation
        const insertdoc = { 
            negotiationid: newnegotiationid, 
            confirmed: false, 
            stage:0, 
            convey
        }
        try {
            let insertion = await req.db.collection('negotiation').insertOne(insertdoc);
            if (insertion.ops && insertion.ops.length){
                const result = insertion.ops[0]
                res.json(result);
            }else{
                res.status(400).json({error:"unable to make post request", detail: error});
            }
        } catch (e) {
            res.status(400).json({error:"unable to make post request", detail: error});
        };

    }else if (party === "receive" && receive && receive.conveyprice && receive.receiveprice && receive.timed && receive.currency && negotiationid){
        //initialize considerationlist into created negotiation
        let updatedoc = { 
            confirmed: false, 
            stage:0, 
            receive
        }

        try {
            let result = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
            console.log(result)
            if (result && result.convey){
                console.log(result)
                // updatedoc = {...updatedoc, confirmed : true, confirmtime: Date.now()}
                await req.db.collection('negotiation').updateOne({'negotiationid': negotiationid}, [ { $set: updatedoc } ])
                result = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
                res.json(result);
            }else{
                console.log(result)
                res.status(400).json({error:"negotiationid not found", detail: error});
            }
        } catch (error) {
            res.status(400).json({error:"negotiationid not found", detail: error});
        }
    }else{
        res.status(400).json({error: "please provide proper parameters"});
    }
});

handler.put(async (req, res) => {
    const {negotiationid, party} = req.body
    if(negotiationid && negotiationid!=="" && party && party!=="" ){
        const updatedoc = {[party] : req.body[party]}
        await req.db.collection('negotiation').updateOne({'negotiationid': negotiationid}, [ { $set: updatedoc } ])
    }else{
        res.status(400).json({error: "please provide proper parameters"});
    }
});


// handler.delete(async (req, res)=>{
//     await req.db.collection('negotiation').deleteMany({})
//     res.send("done")
// })


handler.delete(async (req, res)=>{
    const {negotiationid} = req.body
    await req.db.collection('negotiation').deleteOne({'negotiationid': negotiationid})
    res.send("done")
})

function makeid() {
    return (Math.floor(Math.random() * (999999999999 - 123456789900)) + 123456789900).toString()
}



export default handler;