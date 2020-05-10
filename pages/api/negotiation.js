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

//stage 1 for room creation
handler.post(async (req, res) => {
    const {negotiationid, receive, convey} = req.body
    if (negotiationid && negotiationid!==""){
        let updatedoc = {}
        if (receive) updatedoc = {...updatedoc, receive}
        if (convey) updatedoc = {...updatedoc, convey}
        let doc = await req.db.collection('negotiation').updateOne(
            {'negotiationid': negotiationid},
            [
                { $set: updatedoc }
            ]
        )
        if (doc && typeof doc === "object" && doc.result.ok == 1 && doc.result.nModified>0 ){
            const result = await req.db.collection('negotiation').findOne({'negotiationid': negotiationid})
            res.json(result);
        }else{
            res.json({error: "caseid does not exist"});
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
            let insertion = await req.db.collection('negotiation').insertOne( { negotiationid: newnegotiationid, ... {receive}, ...{convey} } );
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