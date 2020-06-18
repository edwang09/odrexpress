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
            convey:{...convey,
                considerationlist : makerandom(convey.receiveprice, convey.conveyprice, 18)
            }
        }
        try {
            let insertion = await req.db.collection('negotiation').insertOne(insertdoc);
            if (insertion.ops && insertion.ops.length){
                const result = insertion.ops[0]
                res.json({...result, receive: {...result.receive, considerationlist:undefined}});
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
            receive:{...receive,
                considerationlist : makerandom(receive.receiveprice, receive.conveyprice, 18)
            }
        }

        try {
            let result = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
            if (result && result.convey && result.convey.considerationlist){
                updatedoc = {...updatedoc, confirmed : true, confirmtime: Date.now()}
                await req.db.collection('negotiation').updateOne({'negotiationid': negotiationid}, [ { $set: updatedoc } ])
                result = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
                res.json({...result, convey: {...result.convey, considerationlist:undefined}});
            }else{
                res.status(400).json({error:"negotiationid not found", detail: error});
            }
        } catch (error) {
            res.status(400).json({error:"unable to make post request", detail: error});
        }
    }else{
        res.status(400).json({error: "please provide proper parameters"});
    }
});
// handler.delete(async (req, res)=>{
//     await req.db.collection('negotiation').deleteMany({})
//     res.send("done")
// })

function makeid() {
    return (Math.floor(Math.random() * (999999999999 - 123456789900)) + 123456789900).toString()
}
function makerandom(upperbound, lowerbound, count) {
    var result = [];
    for ( var i = 0; i < count; i++ ) {
       result.push({ amount: Math.floor(Math.random()*(upperbound - lowerbound -1) + lowerbound + 1) })
    }
    return result;
}


export default handler;