import nextConnect from 'next-connect';
import database from './database';
const handler = nextConnect();
handler.use(database);


handler.post(async (req, res) => {
    const {negotiationid, receive, convey} = req.body
    if (negotiationid && negotiationid!==""){
        let updatedoc = {}
        if (receive && receive.conveyprice && receive.receiveprice && receive.timed && receive.currency) {
            updatedoc = {receive:{...receive,considerationlist : makerandom(receive.receiveprice, receive.conveyprice, 18)}}
        }else if (convey && convey.conveyprice && convey.receiveprice && convey.timed && convey.currency) {
            updatedoc = {convey:{...convey, considerationlist : makerandom(convey.receiveprice, convey.conveyprice, 18)}}            
        }
        console.log(updatedoc)
        try {
            if(Object.keys(updatedoc).length!==0){
                await req.db.collection('negotiation').updateOne({'negotiationid': negotiationid}, [ { $set: updatedoc } ])
            }
            const result = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
            console.log(result)
            if (result.convey && result.receive && result.confirmed === false){
                const confirmtime = Date.now()
                await req.db.collection('negotiation').updateOne({'negotiationid': negotiationid},[{ $set: {confirmed : true, confirmtime} }])
                res.json({...result, confirmed:true, confirmtime});
            }else{
                res.json(result);
            }
        } catch (error) {
            res.status(400).json({error:"unable to make post request", detail: error});
        }
    }else if(receive || convey){
        let newnegotiationid
        let exist
        do {
            newnegotiationid = makeid(12)
            exist = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
        } while (exist);

        let updatedoc = { negotiationid: newnegotiationid, confirmed: false, stage:0}
        if (receive && receive.conveyprice && receive.receiveprice && receive.timed && receive.currency) {
            updatedoc = {...updatedoc, receive:{...receive,considerationlist : makerandom(receive.receiveprice, receive.conveyprice, 18)}}
        }else if (convey && convey.conveyprice && convey.receiveprice && convey.timed && convey.currency){
            updatedoc = {...updatedoc, convey:{...convey,considerationlist : makerandom(convey.receiveprice, convey.conveyprice, 18)}}
        }
            
        try {
            let insertion = await req.db.collection('negotiation').insertOne(updatedoc);
            if (insertion.ops && insertion.ops.length){
                res.json(insertion.ops[0]);
            }else{
                res.status(400).json({error:"unable to make post request", detail: error});
            }
         } catch (e) {
            res.status(400).json({error:"unable to make post request", detail: error});
         };
    }else{
        res.status(400).json({error: "please provide parameters"});
    }
});


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
export default handler;