import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';
import Considerationbox from '../components/considerationbox';
import styles from './actual.module.scss'
import classNames from 'classnames';
import React from 'react';
import axios from 'axios';
import Matchtable from '../components/matchtable';

let ConfirmationInterval
let CountdownInterval
const APIendpoint = process.env.APIendpoint

export default class HelloWorld extends React.Component {
    state = {
        party: "",
        caseid: "",
        negotiationidinput:"",
        conveyprice: "",
        receiveprice: "",
        currency: "",
        timed: true,
        countdowna: "",
        countdownb: "",
        currentquestion:0,
        currencylist:[],
        convey:{},
        stage:-1,
        receive:{}
        //dummy
        // confirmed:false,
        // stage:0,
        // negotiationid:"285445241188",
    }
    Confirm = async (negotiationid, stage, cb)=>{
        ConfirmationInterval = setInterval(async ()=>{
            console.log("post check confirmation")
            const response = await axios.post(`${APIendpoint}/confirm`,{negotiationid: negotiationid, party: this.state.party})
            if ((response.data.confirmed && stage === 0) || (stage >= 3 && response.data.stage === stage)){
                clearInterval(ConfirmationInterval)
                this.setState({...response.data,
                    // considerationlist: response.data[this.state.party].considerationlist,
                    // considerationsubmited: response.data[`${this.state.party}consideration`],
                },cb)
            }else if(stage === 0){
                this.setState({...response.data})
            }
        },1000)
    }
    validateForm = ()=>{
        let errormsg = []
        const missingfield = ["party", "currency", "conveyprice", "receiveprice", "timed"].filter((field)=> (!this.state[field] || this.state[field]===""))
        if (missingfield.length > 0){
            errormsg.push("Please complete fields: " + missingfield.join(", "))
        }
        if (this.state.conveyprice && parseInt(this.state.conveyprice) && this.state.receiveprice && parseInt(this.state.receiveprice) && parseInt(this.state.receiveprice) <= parseInt(this.state.conveyprice) ){
            errormsg.push("Receive Claim must be greater than Convey Claim")
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
    Countdown = (starttime, countdown, duration) =>{
        CountdownInterval = setInterval(()=>{
            const diff = duration*60*1000 - (Date.now() - starttime)
            if (diff > 0){
                const minute = "00" + Math.floor(diff/1000/60).toString()
                const second = "00" + Math.floor(diff/1000%60).toString()
                const displaytime = `${minute.substring(minute.length-2, minute.length) } : ${second.substring(second.length-2, second.length)}`
                this.setState({[countdown] : displaytime})
            }else{
                clearInterval(CountdownInterval)
            }
        },1000)
    }
    formatCurrency(amt){
        if (!amt) return ""
        return amt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
    setValue = (name, value) =>{
        if (name === "conveyprice" || name === "receiveprice"){
            value = parseInt(value.replace(/\D/g, ""))
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
                    this.Confirm(response.data.negotiationid, 3, ()=>{this.Countdown(response.data.finaltime, "countdownb", 10)})
                }else{
                    this.Countdown(response.data.confirmtime, "countdowna", 45)
                }
                this.Confirm(response.data.negotiationid, 4)
            }else if (response.data.stage === 3){
                this.Countdown(response.data.finaltime, "countdownb", 10)
            }
        }
    }
    componentWillUnmount(){
        clearInterval(ConfirmationInterval)
        clearInterval(CountdownInterval)
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
                this.setState({...res.data}, async ()=>{
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
                }
            })
        }
    }
    editCase = (field) =>{
        // if(this.validateForm()){
        //     console.log(this.validateForm())
        //     this.setState({errors: this.validateForm()})
        // }else{
            this.setState({errors: []})
            const value = (field === "conveyprice" ||field === "receiveprice" ) ? parseInt(this.state[field]) : this.state[field]
            const body = {
                party : this.state.party,
                negotiationid : this.state.negotiationid,
                [this.state.party]: {[field]: value}
            }
            axios.put(`${APIendpoint}/negotiation`,body).then(res => {
                console.log(res.data)
                // this.setState({...res.data}, async ()=>{
                //     sessionStorage.setItem('negotiationid', res.data.negotiationid)
                //     sessionStorage.setItem('party', this.state.party)
                //     await this.Confirm(res.data.negotiationid,0)
                // })
            }).catch(err=>{
                console.log(err)
            })
        // }
    }
    postCaseid = ()=>{
        const body = {
            party : this.state.party,
            negotiationid : this.state.negotiationidinput,
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
                sessionStorage.setItem('negotiationid', res.data.negotiationid)
                sessionStorage.setItem('party', this.state.party)
                await this.Confirm(res.data.negotiationid,0)
            })
            
        }).catch(err=>{
            console.log(err.response.data)
            this.setState({errors: err.response.data.error.split()})
        })
    }
    proceedToStages = () =>{
        axios.post(`${APIendpoint}/stage`,{negotiationid:this.state.negotiationid, party: this.state.party})
        .then(res => {
            this.setState({... res.data,
                considerationlist: res.data[this.state.party].considerationlist,
                considerationsubmited: res.data[`${this.state.party}consideration`]
            })
            this.Countdown(res.data.confirmtime, "countdowna", 45)
        }).catch(err=>{
            console.log(err)
        })
    }
    onConsiderationChoose = (e) => {
        const newconsiderationlist = [...this.state.considerationlist]
        const id = parseInt(e.target.id.replace("consideration","").split("-")[0])
        newconsiderationlist[id] = {...newconsiderationlist[id], choice:e.target.name}
        this.setState({considerationlist:newconsiderationlist})
        if (this.state.currentquestion !== 17){
            setTimeout(()=>{
                this.setState({currentquestion:this.state.currentquestion + 1})
            },1000)
        }
    }  
    onConsiderationPrevious = (e) => {
        this.setState({currentquestion:this.state.currentquestion - 1})
    }  
    onConsiderationNext = (e) => {
        this.setState({currentquestion: this.state.currentquestion === 17 ? this.state.currentquestion : this.state.currentquestion + 1})
    }
    onConsiderationSubmit =(e) =>{
        //check for unfinished questions
        const unfinished = this.state.considerationlist.filter((cons)=>{
            return cons.choice === undefined
        })
        if(unfinished && unfinished.length >0){
            this.setState({errors: [`Please complete all questions before submission`]})
        }else{
            const body = {
                negotiationid : this.state.negotiationid,
                [this.state.party]: {
                    considerationlist: this.state.considerationlist
                }
            }
            axios.post(`${APIendpoint}/consideration`,body).then(res => {
                this.setState({... res.data,
                    considerationsubmited: res.data[`${this.state.party}consideration`]
                })
                clearInterval(CountdownInterval)
                this.Confirm(res.data.negotiationid, 3, ()=>{this.Countdown(res.data.finaltime, "countdownb", 10)})
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
                clearInterval(CountdownInterval)
                this.setState(res.data)
                this.Confirm(res.data.negotiationid, 4)
            }).catch(err=>{
                console.log(err)
            })
        }
    }
    render(){
        const {party, caseid, currency, conveyprice, receiveprice, timed, errors} = this.state
        const currencylistRender = this.state.currencylist.map((cur)=>{return (<option value={cur.symbol} key={cur.symbol}>{cur.name}</option>)})
        return (
            <Layout>
              <Head>
                <title>{siteTitle}</title>
              </Head>
                {this.state.stage === -1 && <section className={styles.actual}>
                    <div className={styles.topform}>
                        <div className={styles.toggle}>
                            <p><b>For this case, I am the:</b> </p>
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
                        <div className={styles.case}>
                            <label htmlFor="caseid">Case ID <span>(optional)</span></label>
                            <input type="text" name="caseid" id="caseid" value = {caseid} onChange={(e)=>this.setValue("caseid",e.target.value)}/>
                        </div>
                    </div>
                    <div className={styles.maintext}>
                        <h4>Prior to the commencement of proceedings</h4>
                        <p> All parties shall familiarize themselves with the Interactive Demo.</p>
                        <p>The below 1, 2, 3 and 4 Claim Variables must be agreed upon in advance by the opposing parties.</p>
                        <p>Communication for this advance agreement may include: text / e¬mail / fax.</p>
                        <h4>At the commencement of proceedings</h4>
                        <p>The opposing parties are on this Actual case page at their calendared Start Time.</p>
                        <p>Having every Claim Variable at hand enables the Actual case data to be entered in seconds.</p>
                        <p>Completion of this Actual case page by both parties enables advancement to the Verification module.</p>
                    </div>
                    <hr/>
                    <div className={styles.secondarytext}>
                        <div>
                            <h4>Convey Party data entry </h4>
                            <div  className={classNames({[styles.greyout]:this.state.party !== "convey"})}>
                                <p>Provided your claim was agreed upon as viable by the Receive Party: </p>
                                <ul>
                                    <li>Both parties must utilize the same Currency</li>
                                    <li>Enter your claim in field number 2</li>
                                </ul>
                                <p>Provided you agree that the Receive Party claim is viable: </p>
                                <ul>
                                    <li>Enter the Receive Party claim in field number 3</li>
                                </ul>
                                <p>Continue to number 4 and make your No or Yes selection </p>
                            </div>
                        </div>
                        <div>
                            <h4>Receive Party data entry</h4>
                            <div  className={classNames({[styles.greyout]:this.state.party !== "receive"})}>
                                <p>Provided your claim was agreed upon as viable by the Convey Party: </p>
                                <ul>
                                    <li>Both parties must utilize the same Currency</li>
                                    <li>Enter your claim in field number 3</li>
                                </ul>
                                <p>Provided you agree that the Convey Party claim is viable: </p>
                                <ul>
                                    <li>Enter the Receive Party claim in field number 2</li>
                                </ul>
                            <p>Continue to number 4 and make your No or Yes selection </p>
                            </div>
                        </div>
                    </div>
                    <hr/>
                    <div className={styles.bottomform}>
                    <form>
                        <div className={styles.formgroup}>
                            <label htmlFor="currency">1. Currency</label>
                            <select disabled={this.state.party === ""} id="currency" name="currency" value = {currency} onChange={(e)=>this.setValue("currency", e.target.value)}   >
                                <option value="">Please Select ... </option>
                                {currencylistRender}
                            </select>
                        </div>
                        <div className={styles.formgroup}>
                            <label htmlFor="conveyprice">2. Convey Party Negotiable Claim</label>
                            <input disabled={this.state.party === ""}  value = {this.formatCurrency(conveyprice)} onChange={(e)=>this.setValue("conveyprice",e.target.value)}  type="text" id="conveyprice" name="conveyprice" placeholder="Amount (subject to contingencies) Convey Party is willing to allocate to Receive Party"/>
                        </div>
                        <div className={styles.formgroup}>
                            <label htmlFor="receiveprice">3. receive Party Negotiable Claim</label>
                            <input  disabled={this.state.party === ""} value = {this.formatCurrency(receiveprice)} onChange={(e)=>this.setValue("receiveprice",e.target.value)} type="text" id="receiveprice" name="receiveprice" placeholder="Amount (subject to contingencies) Receive Party is willing to receive from Convey Party"/>
                        </div>
                        <div className={styles.formgroup}>
                            <label htmlFor="receiveprice">4. Start Time calendared</label>
                            <div className={styles.switch} onClick={()=>{if (this.state.party !== "") this.setValue("timed", !timed)}} >
                                <input id="timed" name="timed" type="checkbox"/>
                                <span className={classNames(styles.slider,{[styles.checked]:timed})}></span>
                            </div>
                        </div>
                        {errors && errors.map((error)=>(<p className={styles.errorMessage}>{error}</p>))}
                        Within a reasonable time frame from one another, both parties shall <span className={styles.submit} onClick={()=>this.postCase()}>CLICK HERE</span> to proceed to the Verification module.
                    </form>
                    </div>
                </section>
                }        
                {this.state.stage === 0 && <section className={styles.verification}>

                {this.state.negotiationid && <h4>Numeric Key: {this.state.negotiationid}</h4>}
                {errors && errors.map((error)=>(<p className={styles.errorMessage}>{error}</p>))}

                {this.state.party === "convey" && <ul>
                    <li>
                    Provide the above Numeric Key to the Receive party via:  text / e-mail / fax 
                    </li>
                    <li>
                    The Receive party shall enter the Numeric Key in their CAPTURE field
                    </li>
                    <li>
                    Receive party shall click their CLICK HERE link to allow opposing party sharing of the Numeric Key
                    </li>
                    <li>
                    Pending mode for both parties will update to <b style={{color:"green"}}>Match</b> if data entries match
                    </li>
                    <li>
                    Pending mode for both parties will update to <b style={{color:"red"}}>Mis-match</b>  if data entries do not match
                    </li>
                    <li>
                    If <b style={{color:"red"}}>Mis-match</b>  occurs, begin a new case at no charge.  See FAQ for details
                    </li>
                </ul>}
                {this.state.party === "receive" && <ul>
                    <li>
                    Await the Numeric Key from the Convey party via:  text  / e-mail / fax 
                    </li>
                    <li>
                    Enter the Numeric Key in the CAPTURE field >>
                    <input value = {this.state.negotiationidinput} 
                            onChange={(e)=>this.setValue("negotiationidinput",e.target.value)} 
                            type="text" id="negotiationidinput" name="negotiationidinput" />
                    </li>
                    <li>
                    <a onClick={()=>this.postCaseid()}>CLICK HERE</a> to allow opposing party sharing of the Numeric Key
                    </li>
                    <li>
                    Pending mode for both parties will update to <b style={{color:"green"}}>Match</b> if data entries match 
                    </li>
                    <li>
                    Pending mode for both parties will update to <b style={{color:"red"}}>Mis-match</b> if data entries do not match 
                    </li>
                    <li>
                    If <b style={{color:"red"}}>Mis-match</b> occurs, begin a new case at no charge.  See FAQ for details
                    </li>
                </ul>}
                {/* <div className={styles.tablecontainer}> */}
                    <Matchtable 
                    formatCurrency = {this.formatCurrency}
                    form = {{currency:this.state.currency,conveyprice:this.state.conveyprice,receiveprice:this.state.receiveprice,timed:this.state.timed}}
                    party={this.state.party} 
                    convey={this.state.convey} 
                    receive={this.state.receive} 
                    setValue={(field, value) => this.setValue(field, value)} 
                    editCase={(field)=>this.editCase(field)} />
                {/* </div> */}
                <button onClick={this.proceedToStages.bind(this)} disabled={!this.state.confirmed}>Proceed</button>
                </section>
                }

                {this.state.negotiationid && this.state.confirmed  && this.state.stage > 0 && <section className={styles.negotiation}>
                    <div className={styles.progressbar}>
                        <div className={classNames(styles.progress, {[styles.active]:((this.state.stage === 1 || this.state.stage === 2) && !this.state.considerationsubmited)})}>
                            <p>Considerations in Progress</p>
                        </div>
                        <div className={classNames(styles.progress, {[styles.active]:(this.state.stage === 2 && this.state.considerationsubmited)})}>
                            <p>All Considerations Logged</p>
                        </div>
                        <div className={classNames(styles.progress, {[styles.active]:this.state.stage == 3})}>
                            <p>Monetary Analysis</p>
                        </div>
                        <div className={classNames(styles.progress, {[styles.active]:this.state.stage == 4})}>
                            <p>Non-Binding Recommendation</p>
                        </div>
                    </div>

                    <div className={styles.timerbar}>
                        <div className={styles.timer}>
                            Countdown A : {this.state.countdowna}
                        </div>
                        <div className={styles.timer}>
                            Countdown B : {this.state.countdownb}
                        </div>
                    </div>

                    {((this.state.stage === 1 || this.state.stage === 2) && !this.state.considerationsubmited) && <div>
                            <p>As each of the 18 sums is generated, you shall make a Consideration as to the feasibility of that specific amount</p>                        
                            {errors && errors.map((error)=>(<p className={styles.errorMessage}>{error}</p>))}

                            <Considerationbox 
                                considerationlist = {this.state.considerationlist} 
                                currentquestion = {this.state.currentquestion} 
                                onPrevious = {this.onConsiderationPrevious.bind(this)} 
                                onNext = {this.onConsiderationNext.bind(this)} 
                                onSubmit = {this.onConsiderationSubmit.bind(this)} 
                                onConsiderationChoose = {this.onConsiderationChoose.bind(this)} 
                            />
                    </div>
                    }
                    {(this.state.stage === 2 && this.state.considerationsubmited) && <div>
                            <div className={styles.pending}>
                                <h3>Pending ...</h3>
                                <p>Once both parties complete the Considerations, automatic progression to the Monetary Analysis occurs.</p>
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


                
            </Layout>
          )

    }
  
}