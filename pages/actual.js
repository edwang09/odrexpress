
import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';
import Considerationbox from '../components/considerationbox';
import styles from './actual.module.scss'
import classNames from 'classnames';
import React from 'react';
import axios from 'axios';
import Matchtable from '../components/matchtable';
import CheckoutForm from '../components/checkoutform';
import { withRouter  } from 'next/router'
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
const promise = loadStripe("pk_test_BYjXAXt4ejnuDFBNVS1odFYo00xwLnXO2g");

let ConfirmationInterval
const APIendpoint = process.env.APIendpoint

class Actual extends React.Component {
    state = {
        party: "",
        caseid: "",
        negotiationidinput:"",
        conveyprice: "",
        receiveprice: "",
        currency: "",
        timed: false,
        currentquestion:0,
        currencylist:[],
        convey:{},
        stage:-1,
        receive:{},
        missingfield:[],
        showpaymentmodal :false,
        connection:"",
        connectionCheck:{},
        tab:"introduction"
        //dummy
        // stage:0,
        // negotiationid:"285445241188",
    }
    switchTab = (tab) =>{
        if (this.state.connection!=="complete"){
            this.setState({tab})
        }
    }

    Confirm = async (negotiationid, stage, cb)=>{
        ConfirmationInterval = setInterval(async ()=>{
            console.log("post check confirmation")
            const response = await axios.post(`${APIendpoint}/confirm`,{negotiationid: negotiationid, party: this.state.party})
            if (stage >= 3 && response.data.stage === stage){
                clearInterval(ConfirmationInterval)
                this.setState({...response.data, tab:"confirmation"},cb)
            }else if(stage === 0 && response.data.convey && response.data.receive){
                clearInterval(ConfirmationInterval)
                if (response.data.convey.currency === response.data.receive.currency && 
                    response.data.convey.receiveprice === response.data.receive.receiveprice && 
                    response.data.convey.conveyprice === response.data.receive.conveyprice){
                    this.setState({connection:"complete", tab:"confirmation", connectionCheck:{
                        numericID:true,
                        currency: response.data.convey.currency === response.data.receive.currency,
                        receiveprice: response.data.convey.receiveprice === response.data.receive.receiveprice,
                        conveyprice: response.data.convey.conveyprice === response.data.receive.conveyprice,
                    }})
                }else{
                    this.setState({connection:"error", tab:"confirmation", connectionCheck:{
                        numericID:true,
                        currency: response.data.convey.currency === response.data.receive.currency,
                        receiveprice: response.data.convey.receiveprice === response.data.receive.receiveprice,
                        conveyprice: response.data.convey.conveyprice === response.data.receive.conveyprice,
                    }})
                }
            }
        },1000)
    }
    validateForm = ()=>{
        let errormsg = []
        const missingfield = ["party", "currency", "conveyprice", "receiveprice", "timed"].filter((field)=> (!this.state[field] || this.state[field]===""))
        this.setState({missingfield})
        // if (missingfield.length > 0){
        //     errormsg.push("Please complete fields: " + missingfield.join(", "))
        // }
        if (this.state.conveyprice && parseInt(this.state.conveyprice) && this.state.receiveprice && parseInt(this.state.receiveprice) && parseInt(this.state.receiveprice) <= parseInt(this.state.conveyprice) ){
            errormsg.push("Greater / Lessor error. Monetary correction(s) are required now.")
            return errormsg
        }else if (missingfield.length > 0){
            return errormsg
        }else{
            return false
        }
    }
    displayPrice = (x) => {
        x = x.toString();
        var pattern = /(-?\d+)(\d{3})/;
        while (pattern.test(x))
            x = x.replace(pattern, "$1,$2");
        return x;
    }

    formatCurrency(amt){
        if (!amt) return ""
        return amt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
    setValue = (name, value) =>{
        if (name === "conveyprice" || name === "receiveprice"){
            // console.log(value)
            value = parseInt(value.replace(/\D/g, ""))
            // console.log(value)
            return this.setState({[name]:value})
        }
        return this.setState({[name]:value})
    }
    async componentDidMount(){
        axios.get(`${APIendpoint}/setting`).then((res)=> this.setState({currencylist:res.data.setting.currency}))
        const party = sessionStorage.getItem('party',null)
        const negotiationid = sessionStorage.getItem('negotiationid',null)
        if (party && negotiationid){
            const response = await axios.post(`${APIendpoint}/confirm`,{negotiationid, party})
            console.log(response.data)
            this.setState({...response.data,
                party,
                considerationlist: response.data[party].considerationlist,
                considerationsubmited: response.data[`${party}consideration`],
            })
            if (response.data.stage === 0){
                await this.Confirm(response.data.negotiationid,0)
            }else if (response.data.stage === 1 || response.data.stage === 2 ){
                if (response.data[`${party}consideration`]){
                    this.Confirm(response.data.negotiationid, 3, ()=>{})
                }
                this.Confirm(response.data.negotiationid, 4)
            }
        }
    }
    componentWillUnmount(){
        clearInterval(ConfirmationInterval)
    }
    postCase = () =>{
        if(this.validateForm()){
            console.log(this.validateForm())
            this.setState({errors: this.validateForm()})
        }else if (this.state.party === "convey"){
            this.setState({errors: []})
            const body = {
                party : this.state.party,
                [this.state.party]: {
                    caseid : this.state.caseid,
                    currency: this.state.currency,
                    conveyprice: parseInt(this.state.conveyprice),
                    receiveprice: parseInt(this.state.receiveprice),
                    timed: this.state.timed
                }
            }
            axios.post(`${APIendpoint}/negotiation`,body).then(res => {
                console.log(res.data)
                this.setState({...res.data, tab:"confirmation"}, async ()=>{
                    sessionStorage.setItem('negotiationid', res.data.negotiationid)
                    sessionStorage.setItem('party', this.state.party)
                    await this.Confirm(res.data.negotiationid,0)
                })
            }).catch(err=>{
                console.log(err)
            })
        }else if (this.state.party === "receive"){
            this.setState({
                stage: 0,
                errors: [],
                receive:{
                    currency: this.state.currency,
                    conveyprice: this.state.conveyprice,
                    receiveprice: this.state.receiveprice,
                    timed: this.state.timed,
                },
                tab:"confirmation"
            })
        }
    }
    postCaseid = ()=>{
        if (this.state.negotiationid){return}
        const body = {
            party : this.state.party,
            negotiationid : this.state.negotiationidinput.replace(/\s/g,""),
            [this.state.party]: {
                caseid : this.state.caseid,
                currency: this.state.currency,
                conveyprice: parseInt(this.state.conveyprice),
                receiveprice: parseInt(this.state.receiveprice),
                timed: this.state.timed
            }
        }
        console.log(body)
        axios.post(`${APIendpoint}/negotiation`,body).then(res => {
            this.setState({...res.data}, async ()=>{
                console.log(res.data)
                if (res.data.convey.currency === res.data.receive.currency && 
                    res.data.convey.receiveprice === res.data.receive.receiveprice && 
                    res.data.convey.conveyprice === res.data.receive.conveyprice){
                    sessionStorage.setItem('negotiationid', res.data.negotiationid)
                    sessionStorage.setItem('party', this.state.party)
                    this.setState({connection:"complete", connectionCheck:{
                        numericID:true,
                        currency: true,
                        receiveprice: true,
                        conveyprice: true,
                    }})
                }else{
                    this.setState({connection:"error", connectionCheck:{
                        numericID:true,
                        currency: res.data.convey.currency === res.data.receive.currency,
                        receiveprice: res.data.convey.receiveprice === res.data.receive.receiveprice,
                        conveyprice: res.data.convey.conveyprice === res.data.receive.conveyprice,
                    }})
                }
            })
        }).catch(err=>{
            console.log(err.response.data)
            this.setState({errors: err.response.data.error.split()})
            this.setState({connection:"error", connectionCheck:{
                numericID: false,
                currency: false,
                receiveprice: false,
                conveyprice: false,
            }})
        })
    }
    proceedToPayment = () =>{
        if (this.state.connection==="complete"){
            this.setState({showpaymentmodal:true})
        }
    }
    proceedToStages=()=>{
        console.log("payment succeed")
        this.setState({showpaymentmodal:false})
        axios.post(`${APIendpoint}/stage`,{negotiationid:this.state.negotiationid, party: this.state.party})
        .then(res => {
            this.setState({... res.data,
                considerationlist: res.data[this.state.party].considerationlist,
                considerationsubmited: res.data[`${this.state.party}consideration`]
            })
        }).catch(err=>{
            console.log(err)
        })
    }
    onConsiderationChoose = (e) => {
        const newconsiderationlist = [...this.state.considerationlist]
        const id = parseInt(e.target.id.replace("consideration","").split("-")[0])
        newconsiderationlist[id] = {...newconsiderationlist[id], choice:e.target.name}
        this.setState({considerationlist:newconsiderationlist})
    }  
    onConsiderationPrevious = (e) => {
        const newconsiderationlist = this.state.considerationlist.map((consideration, id)=>{
            if (id === (this.state.currentquestion - 1) || id === this.state.currentquestion) return {...consideration, choice : undefined}
            return consideration
        })
        this.setState({considerationlist:newconsiderationlist, currentquestion:this.state.currentquestion - 1})
    }  
    onConsiderationNext = (e) => {
        this.setState({currentquestion: this.state.currentquestion === 17 ? this.state.currentquestion : this.state.currentquestion + 1})
    }
    onConsiderationSubmit =(e) =>{
        //check for unfinished questions
        const unfinished = this.state.considerationlist.filter((cons)=> !cons.choice)
        if(unfinished && unfinished.length >0){
            this.setState({errors: [`Please complete all questions before submission`]})
        }else{
            const body = {
                negotiationid : this.state.negotiationid,
                [this.state.party]: {
                    considerationlist: this.state.considerationlist
                }
            }
            this.setState({considerationsubmited: true})
            axios.post(`${APIendpoint}/consideration`,body).then(res => {
                this.setState({... res.data,
                    considerationsubmited: res.data[`${this.state.party}consideration`]
                })
                this.Confirm(res.data.negotiationid, 3, ()=>{})
            }).catch(err=>{
                console.log(err)
            })
        }
    }
    onDecisionSubmit =(e) =>{
        if(!this.state.decision || (this.state.decision !== "reject" && this.state.decision !== "accept")){
            this.setState({errors: [`Please complete your preference before submission`]})
        }else{
            const body = {
                negotiationid : this.state.negotiationid,
                [`${this.state.party}decision`]: this.state.decision
            }
            axios.post(`${APIendpoint}/decision`,body)
            .then(res => {
                this.setState(res.data)
                this.Confirm(res.data.negotiationid, 4)
            }).catch(err=>{
                console.log(err)
            })
        }
    }
    clearCase =()=>{
        const body = {negotiationid: this.state.negotiationid}
        axios.delete(`${APIendpoint}/negotiation`,body)
        .then(res => {
            console.log("done")
            sessionStorage.removeItem('party')
            sessionStorage.removeItem('negotiationid')
            this.props.router.push("/")
            // window.location.reload(false);
        }).catch(err=>{
            console.log(err)
        })
    }
    clearInput =()=>{
        this.setState({
            party: "",
            conveyprice: "",
            receiveprice: "",
            currency: "",
            timed: false},()=>{
                sessionStorage.removeItem('party')
                sessionStorage.removeItem('negotiationid')
                this.props.router.push("/")
            })
    }
    handleNegotiationidInput = (value) =>{
        const rawvalue = value.replace(/\s/g,"").slice(0,9)
        console.log(value)
        console.log(rawvalue)
        this.setState({[`negotiationidinput`] : rawvalue})
    }
    getNegotiationidInput = () =>{
        const rawvalue = this.state[`negotiationidinput`]
        let result = rawvalue.slice(0,3)
        if (rawvalue.length > 3 ){
            result = result + " " + rawvalue.slice(3,6)
        }
        if (rawvalue.length > 6 ){
            result = result + " " + rawvalue.slice(6,9)
        }
        console.log(result)
        return result
    }
    formatNegotiationid = (negotiationid)=>{
        if (!negotiationid) return ""
        return ` ${negotiationid.slice(0,3)} ${negotiationid.slice(3,6)} ${negotiationid.slice(6,9)}`
    }
    render(){
        const {party, caseid, currency, conveyprice, receiveprice, timed, errors} = this.state
        const currencylistRender = this.state.currencylist.map((cur)=>{return (<option value={cur.symbol} key={cur.symbol}>{cur.name}</option>)})
        return (
            <Layout>
              <Head>
                <title>{siteTitle}</title>
              </Head>
                {this.state.showpaymentmodal && (
                    <div className={styles.overlay} onClick={()=>this.setState({showpaymentmodal:false})}>
                        <div className={styles.paymentmodal}  onClick={(e)=>e.stopPropagation()}>
                            <Elements stripe={promise}>
                                <CheckoutForm paymentSucceed={this.proceedToStages.bind(this)}/>
                            </Elements>
                        </div>
                    </div>
                )
                }

                <ul className={styles.subnav}>
                    <li>
                        <p className={classNames({[styles.navlink]:true, [styles.disabled]:this.state.connection==="complete"})} onClick = {()=>{this.switchTab("introduction")}} style={(this.state.tab ==="introduction") ? {fontWeight: "bold"} : {}}>Introduction</p>
                    </li>
                    <li>
                        <p className={classNames({[styles.navlink]:true, [styles.disabled]:this.state.connection==="complete"})} onClick = {()=>{this.switchTab("dataentry")}} style={(this.state.tab ==="dataentry") ? {fontWeight: "bold"} : {}}>Data Entry</p>
                    </li>
                    <li>
                        <p className={classNames({[styles.navlink]:true, [styles.forced]:this.state.connection==="complete"})} onClick = {()=>{this.switchTab("confirmation")}} style={(this.state.tab ==="confirmation") ? {fontWeight: "bold"} : {}}>Confimation</p>
                    </li>
                </ul>
                {(this.state.tab==="introduction") &&
                    <section  className={styles.introduction }>
                        <h4>Parties</h4>
                        <p>The ODR EXPRESS process consists of two opposing parties.</p>
                        <p>These parties are referenced as the Convey Party and the Receive Party.</p>
                        <p>Both the Convey Party and the Receive Party enter Claims.</p>
                        <p>The Convey Claim is the sum that the Convey Party is willing to allocate to the Receive Party.</p>
                        <p>The Receive Claim is the amount that the Receive Party is willing to accept from the Convey Party.</p>
                        <h4>Successful Matching</h4>
                        <p>The Data Entry page is the starting point to achieve a successful match.</p>
                        <p>A virtual connection between the opposing parties is achieved via a Numeric Key.</p>
                        <p>Prior to implementation of an ACTUAL case, the Claim Variables below must be mutually agreed upon.</p>
                        <ul>
                            <li>Currency </li>
                            <li>Convey negotiable claim </li>
                            <li>Receive negotiable claim </li>
                            <li>Start Time calendared</li>
                        </ul>
                        <p>Regarding the mitigation of potential errors including:</p>
                        
                        <ul>
                            <li>proximity constraints</li>
                            <li>miscommunication</li>
                            <li>Receive negotiable claim </li>
                            <li>transposition</li>
                        </ul>
                        <p>Each party shall formulate their own internal guidelines to insure strict attention to Data Entry.</p>
                    </section>
                }
                {/* {(this.state.stage === -1 && this.state.tab==="dataentry") && */}
                {this.state.tab==="dataentry" &&
                    <section className={styles.actual}>
                        <div className={styles.topform}>
                            <div className={styles.toggle}>
                                <p><b>For this case, I am the:</b></p>
                                <div className={styles.radiobutton}>
                                    <input type="radio" name="party" value="convey" id="convey" checked={this.state.party === "convey" } 
                                    onChange={(e)=>this.setValue("party", e.target.value)}
                                    className={classNames({[styles.checked]:party==="convey"})}/>
                                    <label htmlFor="convey" >Convey Party</label>
                                </div>
                                <div className={styles.radiobutton} >
                                    <input type="radio" name="party" value="receive" id="receive" checked={this.state.party === "receive" } 
                                    onChange={(e)=>this.setValue("party", e.target.value)}
                                    className={classNames({[styles.checked]:party==="receive"})}/>
                                    <label htmlFor="receive">Receive Party</label>
                                </div>
                            </div>
                        </div>
                        <div className={styles.maintext}>
                            <p>Each party shall have familiarization with the DEMO and the FAQ.</p>
                            <p>All four Claim Variables below must be agreed upon by the opposing parties before a case is to BEGIN.</p>
                            <p>Communication between opposing parties shall be via e-mail or text.</p>
                            <p>The opposing parties shall be on this Data Entry page at their calendared Start Time.</p>
                            <p>In the event of a hindrance, click <span style={{color:"red", cursor:"pointer"}}  onClick={()=>this.clearInput()}>DISCARD</span> to begin anew at a mutually convenient time.</p>
                        </div>
                        <hr/>
                        <div className={styles.secondarytext}>
                            <div>
                                <h4>Claim Variables </h4>
                                <p>As mentioned above:</p>
                                <p>All four Claim Variables below must be agreed upon by the opposing parties before a case is to BEGIN</p>
                            </div>
                        </div>
                        <hr/>
                        <div className={styles.bottomform}>
                        <form>
                            <div className={styles.formgroup}>
                                <label htmlFor="currency"><span>1.</span>
                                <span style={{color:((this.state.missingfield.findIndex((field)=>field === "currency")>-1) ? "red" : "auto")}}>Currency</span>
                                </label>
                                
                                <div className={styles.input}>
                                {this.state.currency && <p>{this.state.currency}</p>}
                                <select disabled={this.state.party === ""} id="currency" name="currency" value = {currency} onChange={(e)=>this.setValue("currency", e.target.value)}   >
                                    <option value="">Select a mutually agreed upon currency</option>
                                    {currencylistRender}
                                </select>
                                </div>
                            </div>
                            <div className={styles.formgroup}>
                                <label htmlFor="conveyprice">
                                    <span>2.</span> 
                                    <span style={{color:((this.state.missingfield.findIndex((field)=>field === "conveyprice")>-1) ? "red" : "auto")}}>Convey&nbsp;</span> 
                                    <span>negotiable claim</span> 
                                </label>

                                <div className={styles.input}>
                                {this.state.currency && <p>{this.state.currency}</p>}
                                    <input disabled={this.state.party === ""}  value = {this.formatCurrency(conveyprice)} onChange={(e)=>this.setValue("conveyprice",e.target.value)}  type="text" id="conveyprice" name="conveyprice" placeholder="Contingent amount Convey Party is willing to allocate to the Receive Party."/>
                                </div>
                            </div>
                            <div className={styles.formgroup}>
                                <label htmlFor="receiveprice">
                                    <span>3.</span> 
                                    <span style={{color:((this.state.missingfield.findIndex((field)=>field === "receiveprice")>-1) ? "red" : "auto")}}>Receive&nbsp;</span> 
                                    <span>negotiable claim</span> 
                                </label>
                                <div className={styles.input}>
                                    {this.state.currency && <p>{this.state.currency}</p>}
                                    <input  disabled={this.state.party === ""} value = {this.formatCurrency(receiveprice)} onChange={(e)=>this.setValue("receiveprice",e.target.value)} type="text" id="receiveprice" name="receiveprice" placeholder="Contingent amount Receive Party is willing to accept from the Convey Party."/>
                                </div>
                            </div>
                            <div className={styles.formgroup}>
                                <div className={styles.timedradio}>
                                    <label htmlFor="receiveprice"><span>4.</span> <span>Start Time calendared</span> </label>
                                    <div  className={styles.radiobutton}>
                                        <input type="radio"  disabled={this.state.party === ""} value="no" id="timedno" name="timed" onClick={()=>{this.setValue("timed", false)}} checked={!timed}  />
                                        <label htmlFor="timedno">No</label>
                                        <input type="radio"  disabled={this.state.party === ""} value="yes" id="timedyes" name="timed" onClick={()=>{this.setValue("timed", true)}} checked={timed} />
                                        <label htmlFor="timedyes">Yes</label>
                                    </div>
                                </div>
                                <small><span className={classNames({[styles.red]:(this.state.missingfield.findIndex((field)=>field === "timed")>-1 &&  timed===false)})} >Requires Yes to proceed</span>, with consideration if needed for time zone differences.</small>
                            </div>
                            {errors && errors.map((error)=>(<p className={styles.errorMessage}>{error}</p>))}
                            <p>Within a reasonable time frame from one another, both parties shall <span className={styles.submit} onClick={()=>this.postCase()}>click HERE</span> to advance to the Numeric Key.</p>
                            <b>If either party considers that the opposition is unrealistic with their claim, than neither party is obligated to continue.</b>
                        </form>
                        </div>
                    </section>
                }
                {/* {this.state.stage !== -1 && <div className={styles.clearbutton}><button onClick={()=>this.clearCase()}>DISCARD</button></div>} */}
                {this.state.tab === "confirmation" && 
                    <div>
                    {this.state.stage === 0 && <section className={styles.verification}>
                    {errors && errors.map((error)=>(<p className={styles.errorMessage}>{error}</p>))}

                    {this.state.party === "convey" && <div className={styles.instructions}>
                        <h4 className={styles.key}>Numeric Key: &nbsp;&nbsp;<b>{this.formatNegotiationid(this.state.negotiationid)}</b></h4>
                        <h4><b>Numeric Key Interaction</b></h4>
                        <p>
                        In an expedited amount of time, you, the Convey Party, shall provide the above Numeric Key to the Receive Party.
Transmission of the Numeric Key shall be via Email or text.
                        </p>
                        <p>
                        The Receive Party shall process the Numeric Key to effectuate the joining of the opposing parties.
                        </p>
                    </div>}
                    {this.state.party === "receive" && <div className={styles.instructions}>
                        <h4 className={styles.key}>Pending Numeric Key: &nbsp;&nbsp;<b>{this.formatNegotiationid(this.state.negotiationid)}</b></h4>
                        <h4><b>Numeric Key Interaction</b></h4>
                        <p className={classNames({[styles.disabled]:this.state.negotiationid})} >
                            You, the Receive Party, shall await the Numeric Key from the Convey Party via Email or text.
                        </p>
                        <p className={classNames({[styles.disabled]:this.state.negotiationid})} >
                            Upon receipt, enter the Numeric Key in the  CAPTURE field <span style={{fontSize:"168%", lineHeight:"1"}}>   &raquo; </span>
                        <input value = {this.getNegotiationidInput()} 
                                disabled = {this.state.negotiationid}
                                ref={(input) => { this.negotiationidinput = input; }} 
                                onChange={(e)=>{e.preventDefault();this.handleNegotiationidInput(e.target.value)}} 
                                type="text" id="negotiationidinput" name="negotiationidinput" />
                        </p>
                        <p className={classNames({[styles.disabled]:this.state.negotiationid})} >
                        <span><a onClick={()=>this.postCaseid()}>Click HERE</a> to join the parties, then allow 2 minutes or less for Convey Party confirmation. </span>
                        </p>
                    </div>}
                        <div className={styles.indicators}>
                            <p>
                            To proceed, the below 4 bullet points must display as bold within 2 minutes after Receive Party processing.
                            </p>
                        </div>
                        <ul className={styles.connectionCheckList}>
                            <li className={classNames({[styles.check]:this.state.connectionCheck.numericID})}>Numeric Key.</li>
                            <li className={classNames({[styles.check]:this.state.connectionCheck.currency})}>Currency</li>
                            <li className={classNames({[styles.check]:this.state.connectionCheck.conveyprice})}>Convey negotiation claim</li>
                            <li className={classNames({[styles.check]:this.state.connectionCheck.receiveprice})}>Receive negotiation claim</li>
                        </ul>
                        <p>If all four (4) bullet points are <b>bold</b>, <a onClick={()=>this.proceedToPayment()}>click HERE</a> to advance to the secure Payment Gateway.</p>
                        <p>If any of the bullet points are NOT <b>bold</b>:</p>
                        <p>Click <a style={{color:"red"}} onClick={()=>this.clearCase()}>DISCARD</a> to allow the opposing parties to begin anew at a mutually convenient time.</p>
                        <p><b>Advancement to the secure Payment Gateway has yet to occur, therefore no fees have been applied.</b></p>
                    </section>
                    }

                    {this.state.negotiationid && this.state.stage > 0 && <section className={styles.negotiation}>
                        <div className={styles.progressbar}>
                            <div className={classNames(styles.progress, {[styles.active]:((this.state.stage === 1 || this.state.stage === 2) && this.state.considerationlist.filter((cons)=> !cons.choice).length > 0)})}>
                                <p>Considerations in Progress</p>
                            </div>
                            <div className={classNames(styles.progress, 
                                {[styles.active]:((this.state.stage === 2 || this.state.stage === 1 ) && 
                                (this.state.considerationsubmited ||( this.state.considerationlist.filter((cons)=>!cons.choice).length === 0 && this.state.currentquestion === 17))) 
                                })}>
                                <p>Considerations Logged</p>
                            </div>
                            <div className={classNames(styles.progress, {[styles.active]:this.state.stage == 3})}>
                                <p>Monetary Analysis</p>
                            </div>
                            <div className={classNames(styles.progress, {[styles.active]:this.state.stage == 4})}>
                                <p>Non-Binding Recommendation</p>
                            </div>
                        </div>

                        {((this.state.stage === 1 || this.state.stage === 2) && !this.state.considerationsubmited) && <div>                            
                                <p>Randomly generated sums for the {this.state.party==="convey" ? "Convey" : "Receive"} Party differ from randomly generated sums for the {this.state.party==="convey" ? "Receive" : "Convey"} Party.</p>             
                                <p>As each of the {this.state.currency} sums is generated, you, the {this.state.party==="convey" ? "Convey" : "Receive"} Party, shall consider the feasibility of that amount.</p>
                                {errors && errors.map((error)=>(<p className={styles.errorMessage}>{error}</p>))}

                                <Considerationbox 
                                    considerationlist = {this.state.considerationlist} 
                                    currentquestion = {this.state.currentquestion} 
                                    onPrevious = {this.onConsiderationPrevious.bind(this)} 
                                    onNext = {this.onConsiderationNext.bind(this)} 
                                    onSubmit = {this.onConsiderationSubmit.bind(this)} 
                                    onConsiderationChoose = {this.onConsiderationChoose.bind(this)}
                                    currency = {this.state.currency} 
                                    party={this.state.party} 
                                />
                        </div>
                        }
                        {((this.state.stage === 1 || this.state.stage === 2) && this.state.considerationsubmited) && <div>
                                <div className={styles.pending}>
                                    <h3>Pending ...</h3>
                                    <p>Remain in this Pending view until all 18 Considerations have been logged by the opposing parties.</p>
                                    <p>Your wait time may vary from 20 seconds to several minutes.</p>
                                    <p>Completion of the 18 Considerations by both parties will enable automatic progression to the Monetary Analysis.</p>
                                </div>
                        </div>
                        }
                        {this.state.stage === 3 && <div>
                                <div className={styles.analysis}>
                                    <div className={styles.info}>
                                        <p>Numeric Key: {this.state.negotiationid}</p>
                                        <p>Familarize yourself with Column 1 and Column 2.</p>
                                        <p>To avoid case abandonment Column 3 must be completed be both parties BEFORE Coundtdown B expires</p>
                                    </div>
                                    <div className={styles.columns}>
                                        <div>
                                            <h4>1. Conditionally Accept Parameters</h4>
                                            If an Accept selection is considered, not the below conditional cariteria:
                                            <ul>
                                                <li>Mutually agreed upon Settlement Agreement</li>
                                                <li>Facilitate by the paries' legal representatives</li>
                                                <li>Signed by the authorized parties</li>
                                            </ul>
                                        </div>
                                        
                                        <div>
                                            <h4>2. Selection Components</h4>
                                            <p>An Accept selection by BOTH parties shall equate to : <b>Conditionally Accept*</b></p>
                                            <p>One Accept and one Reject shall equate to : <b>Reject by BOTH parties</b></p>
                                            <p>Two Reject selections shall equate to : <b>Reject by BOTH parties</b></p>
                                            <small>
                                                *Conditionally Accept
                                            </small><br/>
                                            <small>
                                                Pending a mutually agreed upon Settlement Agreement
                                            </small>
                                        </div>
                                        <div>
                                            <h4>3. {this.state.party} Party Selections</h4>
                                            <div>   
                                                <input type="radio" name="decision" value="accept" id="decisionaccept" onChange={()=>this.setValue("decision", "accept")} checked={this.state.decision === "accept"}/>
                                                <label htmlFor="decisionaccept" >I Conditionally Accept* the Monetary Analysis</label>
                                            </div>
                                            <div>   
                                                <input type="radio" name="decision" value="reject" id="decisionreject" onChange={()=>this.setValue("decision", "reject")}  checked={this.state.decision === "reject"}/>
                                                <label htmlFor="decisionreject" >I Reject the Monetary Analysis</label>
                                            </div>
                                            <p>Both parties may alternate radio selections to view the Non-Binding Recommendation that is provided.</p>
                                            <p>Lock in your preferred radio selection</p>
                                            <small>*Conditionally Accept</small><br/>
                                            <small>Pending a mutually agreed upon Settlement Agreement</small>
                                        </div>
                                    </div>
                                    {errors && errors.map((error)=>(<p className={styles.errorMessage}>{error}</p>))}
                                    <div className={styles.generatenbr}>
                                        <div className={styles.condition}>
                                            <h4>Non-Binding Recommendation (NBR)</h4>
                                            <p>The {this.displayPrice(this.state.final)} USD Monetary Analysis is the sum derived from both parties’ responses to their 18 Considerations.</p>

                                        </div>
                                        <button onClick={this.onDecisionSubmit.bind(this)}>CLICK to Generate the Non-Binding Recommendation(NBR)</button>
                                    </div>
                                </div>
                        </div>
                        }
                        {this.state.stage === 4 && <div>
                            <div className={styles.nbr}>
                                <h4>Non-Binding Recommendation  (NBR)</h4>
                                <p>Both the Convey and Receive parties have provided ODR <b>EXPRESS</b> with quantitative data that has enabled our proprietary algorithms to analyze such data.</p>
                                <p>The resulting Monetary Analysis has generated a <span>{this.displayPrice(this.state.final)}</span> USD sum.</p>
                                <p>Both parties have conditionally <b>{this.state.result && this.state.result.toUpperCase()}</b> the <span>{this.displayPrice(this.state.final)}</span>  USD sum, thus resulting in an <b>{this.state.result && this.state.result.toUpperCase()}</b> outcome.</p>
                                {this.state.result === "accept" && <div className={styles.condition}>
                                    <p> NON-BINDING RECOMMENDATION (NBR)</p>
                                    <p>Based upon both parties electing to Conditionally Accept* the Monetary Analysis, both parties shall incorporate the {this.displayPrice(this.state.final)} USD sum</p>
                                    <p>into a mutually agreed upon Settlement Agreement, facilitated by the parties' legal representatives, and signed by the authorized parties.</p>
                                </div>}
                                {this.state.result === "reject" && <div className={styles.condition}>
                                    <p> NON-BINDING RECOMMENDATION (NBR)</p>
                                    <p>Based upon both, or possibly one of the parties electing to Reject the Monetary Analysis, both parties shall re-evaluate their decision making criteria and objectives</p>
                                </div>}
                                <p>The ODR EXPRESS involvement in this case is now concluded.</p>
                                {this.state.result === "accept" && <p>*Pending a mutually agreed upon Settlement Agreement</p>}
                            </div>
                        </div>
                        }
                    </section>
                    }
                    </div>
                }


                
            </Layout>
          )

    }
  
}



export default withRouter(Actual)