import nextConnect from 'next-connect';
import database from './database';
const handler = nextConnect();
handler.use(database);


handler.post(async (req, res) => {
    const {negotiationid, party} = req.body
    if (negotiationid && negotiationid!==""){
        const result = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
        let updatedoc = {
            stage:1, 
            [party]: {...result[party], 
                considerationlist : makerandom(result[party].receiveprice, result[party].conveyprice, 18)
            }
        }
        if (!result.confirmed){
            updatedoc = {
                ...updatedoc, 
                confirmed : true, 
                confirmtime: Date.now()
            }
        }
        try{
            await req.db.collection('negotiation').updateOne({'negotiationid': negotiationid}, [ { $set: updatedoc } ])
            res.json({...result, ...updatedoc});
        }catch(error){
            res.status(400).json({error:"unable to make post request", detail: error});
        }
    }else{
        res.status(400).json({error: "please provide parameters"});
    }
});
function makerandom(upperbound, lowerbound, count) {
    var result = [];
    for ( var i = 0; i < count; i++ ) {
       result.push({ amount: Math.floor(Math.random()*(upperbound - lowerbound -1) + lowerbound + 1) })
    }
    return result;
}
export default handler;