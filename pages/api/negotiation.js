import nextConnect from 'next-connect';
import database from './database';

const handler = nextConnect();

handler.use(database);

function makeid(length) {
    var result           = '';
    var characters       = '0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
function makerandom(upperbound, lowerbound, count) {
    var result = [];
    for ( var i = 0; i < count; i++ ) {
       result.push({ amount: Math.floor(Math.random()*(upperbound - lowerbound -1) + lowerbound + 1) })
    }
    return result;
 }

//stage 1 for room creation
handler.post(async (req, res) => {
    const {negotiationid, receive, convey} = req.body
    if (negotiationid && negotiationid!==""){
        let updatedoc = {}
        if (receive && receive.conveyprice && receive.receiveprice && receive.timed && receive.currency) {
            updatedoc = {...updatedoc, 
                receive:{...receive,
                    considerationlist : makerandom(receive.receiveprice, receive.conveyprice, 18)
                }
            }
            await req.db.collection('negotiation').updateOne({'negotiationid': negotiationid}, [ { $set: updatedoc } ])
        }else if (convey && convey.conveyprice && convey.receiveprice && convey.timed && convey.currency) {
            updatedoc = {...updatedoc, 
                convey:{...convey,
                    considerationlist : makerandom(convey.receiveprice, convey.conveyprice, 18)
                }
            }            
            await req.db.collection('negotiation').updateOne({'negotiationid': negotiationid}, [ { $set: updatedoc } ])
        }
        const result = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})

        if (result.convey && result.receive ){
            await req.db.collection('negotiation').updateOne({'negotiationid': negotiationid},[{ $set: {confirmed : true, confirmtime: Date.now()} }])
            res.json({...result, confirmed:true});
        }else{
            res.json(result);
        }
    }else if(receive || convey){
        let newnegotiationid
        let exist
        do {
            newnegotiationid = makeid(12)
            exist = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
            console.log(exist)
        } while (exist);
        try {
            let updatedoc = { negotiationid: newnegotiationid, confirmed: false, stage:0}
            if (receive && receive.conveyprice && receive.receiveprice && receive.timed && receive.currency) updatedoc = {...updatedoc, receive:{
                ...receive,
                considerationlist : makerandom(receive.receiveprice, receive.conveyprice, 18)
                }}
            if (convey && convey.conveyprice && convey.receiveprice && convey.timed && convey.currency) updatedoc = {...updatedoc, convey:{
                ...convey,
                considerationlist : makerandom(convey.receiveprice, convey.conveyprice, 18)
            }}
            
            let insertion = await req.db.collection('negotiation').insertOne(updatedoc);
            if (insertion.ops && insertion.ops.length){
                res.json(insertion.ops[0]);
            }else{
                res.json({error: "failed"});
            }
         } catch (e) {
            console.log(e);
         };

    }
});



handler.get(async (req, res) => {

    let doc = await req.db.collection('negotiation').findOne()
    console.log(doc);
    res.json(doc);
});
export default handler;