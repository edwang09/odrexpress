
import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';
import styles from './demo.module.scss'
import classNames from 'classnames';
import React from 'react';
import axios from 'axios';
import { withRouter  } from 'next/router'

let ConfirmationInterval
const APIendpoint = process.env.APIendpoint

class Demo extends React.Component {
    state = {
        party: "",
        caseid: "",
        negotiationidinput:"",
        conveyprice: "14525",
        receiveprice: "19762",
        currency: "NOK",
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
        axios.get(`${APIendpoint}/setting`).then((res)=>{ 
            this.setState({
                currencylist:res.data.setting.currency,
                setting:res.data.setting.setting
            })
        })
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
                <ul className={styles.subnav}>
                    <li>
                        <p className={classNames({[styles.navlink]:true, [styles.disabled]:this.state.connection==="complete"})} onClick = {()=>{this.switchTab("introduction")}} style={(this.state.tab ==="introduction") ? {fontWeight: "bold"} : {}}>Introduction</p>
                    </li>
                    <li>
                        <p className={classNames({[styles.navlink]:true, [styles.disabled]:this.state.connection==="complete"})} onClick = {()=>{this.switchTab("claimvariables")}} style={(this.state.tab ==="claimvariables") ? {fontWeight: "bold"} : {}}>Claim Variables</p>
                    </li>
                    <li>
                        <p className={classNames({[styles.navlink]:true, [styles.forced]:this.state.connection==="complete"})} onClick = {()=>{this.switchTab("distinctions")}} style={(this.state.tab ==="distinctions") ? {fontWeight: "bold"} : {}}>Distinctions</p>
                    </li>
                    <li>
                        <p className={classNames({[styles.navlink]:true, [styles.forced]:this.state.connection==="complete"})} onClick = {()=>{this.switchTab("participate")}} style={(this.state.tab ==="participate") ? {fontWeight: "bold"} : {}}>Participate</p>
                    </li>
                </ul>
                {(this.state.tab==="introduction") &&
                    <section  className={styles.introduction }>
                        <p>Obtaining a familiarity with the DEMO provides comprehensive awareness.</p>
                        <p>Interaction with the DEMO is immediately and freely available.  No registration is required. </p>
                        <p>The DEMO consists of two parties, referenced as the Convey Party and the Receive Party.</p>
                        <p>The party willing to make a monetary allocation is identified as the Convey Party.</p>
                        <p>The party willing to accept a monetary allocation is identified as the Receive Party.</p>
                        <p>The two parties may be friends, relatives, business acquaintances, etc.</p>
                        <p>However, for the DEMO, the two parties will act in opposition to one another.</p>
                        <p>The remote platform accommodates opposing parties whether in the same room or thousands of miles apart.</p>
                        <p>Alternate the Convey Party and the Receive Party implementation, thus achieving a minimum of two practice sessions.</p>
                    </section>
                }
                {this.state.tab==="claimvariables" &&
                    <section className={styles.claimvariables}>
                        <p>The four Claim Variables are:</p>

                        <ul>
                            <li>Currency </li>
                            <li>Convey Party negotiable claim </li>
                            <li>Receive Party negotiable claim </li>
                            <li>Start Time</li>
                        </ul>
                        <p>Claim Variables in the <b>DEMO</b> are addressed in a different manner than Claim Variables in an actual case <b>(BEGIN)</b>.</p>
                        <p>As it pertains to <b>DEMO</b>:<br/>
                            For familiarization purposes, the Claim Variables have been <b>PRESET</b> by the database.  
                        </p>
                        <p>However,</p>
                        <p>As it pertains to <b>BEGIN</b>:<br/>
                        The Claim Variables must be agreed upon <b>IN ADVANCE</b> by the opposing parties <b>BEFORE</b> initiating an actual case.<br/>
                        The advanced agreement shall be in the form of text or e-mail.
                        </p>
                        <p><b>In an actual case (BEGIN). there is no obligation to continue if either party is unrealistic with their claim.</b></p>
                    </section>
                }
                {this.state.tab==="distinctions" &&
                    <section className={styles.distinctions}>
                        <p>In the majority of instances DEMO will parallel BEGIN.</p>
                        <p>Noteworthy distinctions are included below:</p>
                        <h4>Specific to the DEMO:</h4>
                        <ul>
                            <li>the Numeric Key that joins the opposing parties is bypassed</li>
                            <li>the secure Payment Gateway is bypassed </li>
                            <li>a national Currency has been provided by the database</li>
                            <li>all Claim Amounts have been provided by the database</li>
                        </ul>
                        <h4>For the DEMO, on a random basis:</h4>
                        <p>The preset currency will change.<br/>The Currency presently in effect is NOK (Norway krone).</p>
                        <p>The Convey Party negotiable claim will change.<br/>The present negotiable claim for the Convey Party is {this.state.setting.democurrency} {this.formatCurrency(this.state.setting.democonvey)}</p>
                        <p>The Receive Party negotiable claim will change.<br/>The present negotiable claim for the Receive Party is {this.state.setting.democurrency} {this.formatCurrency(this.state.setting.demoreceive)}</p>

                    </section>
                }
                {this.state.tab==="participate" &&
                    <section className={styles.participate}>
                        <p>When the parties are available to Participate, simultaneous interaction with this component should occur.</p>
                        <div className={styles.topform}>
                            <div className={styles.toggle}>
                                <p><b>For this DEMO, I am the:</b></p>
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
                            <p>Preferred communication between opposing parties shall be via e-mail or text.</p>
                            <p>Each party shall have familiarization with the FAQ.        </p>
                            <p>The first three Claim Variables displayed below have been preset by the database.</p>
                            <p>The opposing parties shall be on this Participate page at their # 4 calendared Start Time.</p>
                            <p>A Start Time radio selection of Yes enables advancement to the 18 Considerations.</p>
                            <p>Alternatively, the opposing parties shall click  <span style={{color:"red", cursor:"pointer"}}  onClick={()=>this.clearInput()}>DISCARD</span> to begin anew at a mutually convenient time.</p>
                        </div>
                        <div className={styles.bottomform}>
                        <form>
                            <div className={styles.formgroup}>
                                <label htmlFor="currency"><span>1.</span>
                                <span style={{color:((this.state.missingfield.findIndex((field)=>field === "currency")>-1) ? "red" : "auto")}}>Currency</span>
                                </label>
                                
                                <div className={styles.input}>
                                {this.state.setting.democurrency && <p>{this.state.setting.democurrency}</p>}
                                <select disabled id="currency" name="currency" value = {this.state.setting.democurrency} onChange={(e)=>this.setValue("currency", e.target.value)}>
                                    <option value="">Select a mutually agreed upon currency</option>
                                    {currencylistRender}
                                </select>
                                </div>
                                <div className={styles.instruction}>  <span style={{fontSize:"168%", lineHeight:"1"}}>   &raquo; </span>  This currency has been preset by the database.</div>
                            </div>
                            <small>Select the mutually agreed upon currency from the drop-down menu.</small>
                            <div className={styles.formgroup}>
                                <label htmlFor="conveyprice">
                                    <span>2.</span> 
                                    <span style={{color:((this.state.missingfield.findIndex((field)=>field === "conveyprice")>-1) ? "red" : "auto")}}>Convey&nbsp;</span> 
                                    <span>negotiable claim</span> 
                                </label>

                                <div className={styles.input}>
                                {this.state.setting.democurrency && <p>{this.state.setting.democurrency}</p>}
                                    <input disabled value = {this.formatCurrency(this.state.setting.democonvey)} onChange={(e)=>this.setValue("conveyprice",e.target.value)}  type="text" id="conveyprice" name="conveyprice" placeholder="Contingent amount Convey Party is willing to allocate to the Receive Party."/>
                                </div>
                                <div className={styles.instruction}>  <span style={{fontSize:"168%", lineHeight:"1"}}>   &raquo; </span>  This monetary sum has been preset by the database.</div>
                            </div>
                            <small>
                                {this.state.party="receive" ? "You, the Receive Party, shall enter the contingent  amount initially sent to you via e-mail or text.": "Contingent amount the Convey Party is willing to allocate to the Receive Party."}
                            </small>
                            <div className={styles.formgroup}>
                                <label htmlFor="receiveprice">
                                    <span>3.</span> 
                                    <span style={{color:((this.state.missingfield.findIndex((field)=>field === "receiveprice")>-1) ? "red" : "auto")}}>Receive&nbsp;</span> 
                                    <span>negotiable claim</span> 
                                </label>
                                <div className={styles.input}>
                                    {this.state.setting.democurrency && <p>{this.state.setting.democurrency}</p>}
                                    <input  disabled value = {this.formatCurrency(this.state.setting.demoreceive)} onChange={(e)=>this.setValue("receiveprice",e.target.value)} type="text" id="receiveprice" name="receiveprice" placeholder="Contingent amount Receive Party is willing to accept from the Convey Party."/>
                                </div>
                                <div className={styles.instruction}>  <span style={{fontSize:"168%", lineHeight:"1"}}>   &raquo; </span>  This monetary sum has been preset by the database.</div>
                            </div>
                            <small>
                            {this.state.party="convey" ? "You, the Convey Party, shall enter the contingent amount initially sent to you via e-mail or text.": "Contingent amount the Receive Party is willing to accept from the Convey Party."}
                            </small>
                            <div className={styles.formgroup}>
                                <div className={styles.timedradio}>
                                    <label htmlFor="receiveprice"><span>4.</span> <span>Start Time calendared</span> </label>
                                    <div  className={styles.radiobutton}>
                                        <input type="radio"  disabled={this.state.party === ""}  id="timedno" name="timed" onChange={()=>{this.setValue("timed", false)}} checked={!timed}  />
                                        <label htmlFor="timedno">No</label>
                                        <input type="radio"  disabled={this.state.party === ""} id="timedyes" name="timed" onChange={()=>{this.setValue("timed", true)}} checked={timed} />
                                        <label htmlFor="timedyes">Yes</label>
                                    </div>
                                </div>
                            </div>
                            <small>Requires Yes to proceed, with consideration if needed for time zone differences.</small>
                            {errors && errors.map((error)=>(<p className={styles.errorMessage}>{error}</p>))}
                            <p>Within a reasonable time frame from one another, both parties shall  <span className={styles.submit} onClick={()=>this.postCase()}>click HERE</span> to proceed to the 18 Considerations.</p>
                        </form>
                        </div>
                    </section>
                }
                


                
            </Layout>
          )

    }
  
}



export default withRouter(Demo)