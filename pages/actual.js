import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import Considerationbox from '../components/considerationbox'
import styles from './actual.module.scss'
import classNames from 'classnames';
import React, { useState } from 'react';
import axios from 'axios'

let ConfirmationInterval
let CountdownInterval

export default class HelloWorld extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            APIendpoint : "http://localhost:3000/api",
            party: "convey",
            caseid: "",
            conveyprice: "",
            receiveprice: "",
            currency: "",
            timed: true,
            countdowna: "40:20",
            countdownb: "10:00",
            currentquestion:0
            //dummy
            // confirmed:false,
            // stage:0,
            // negotiationid:"285445241188",
        }
    }
    displayPrice = (x) => {
        x = x.toString();
        var pattern = /(-?\d+)(\d{3})/;
        while (pattern.test(x))
            x = x.replace(pattern, "$1,$2");
        return x;
    }
    displayCountdown = (time, countdown) =>{
        const diff = countdown*60*1000 - (Date.now() - time)
        const minute = "00" + Math.floor(diff/1000/60).toString()
        const second = "00" + Math.floor(diff/1000%60).toString()
        return `${minute.substring(minute.length-2, minute.length) } : ${second.substring(second.length-2, second.length)}`
    }
    booleanToString = (bool)=>{
        return bool ? "True" : "False"
    }
    setValue = (name, value) =>{
        // console.log({[name]:value})
        return this.setState({[name]:value})
    }
    
    postCase = () =>{
        if(this.state.caseid === "" && (!this.state.currency || this.state.currency==="" || 
        !this.state.conveyprice || this.state.conveyprice==="" || 
        !this.state.receiveprice || this.state.receiveprice==="" || 
        !this.state.timed)){
            this.setState({error: "Please complete the above form before preceeding"})
        }else{
            const body = {
                negotiationid : this.state.caseid,
                [this.state.party]: {
                    currency: this.state.currency,
                    conveyprice: parseInt(this.state.conveyprice),
                    receiveprice: parseInt(this.state.receiveprice),
                    timed: this.state.timed
                }
            }
            axios.post(`${this.state.APIendpoint}/negotiation`,body).then(res => {
              if (res.data ){
                console.log(res.error)
                if(res.data.error){
                    this.setState({
                        error: res.data.error
                    })
                }else{
                    this.setState({
                        negotiationid: res.data.negotiationid, 
                        convey: res.data.convey ? res.data.convey : {}, 
                        receive: res.data.receive ? res.data.receive : {},
                        confirmed: res.data.confirmed,
                        stage: res.data.stage,
                        considerationlist: res.data[this.state.party].considerationlist,
                        considerationsubmited: res.data[`${this.state.party}consideration`],
                        final: res.data.final,
                        result: res.data.result,
                        confirmtime: res.data.confirmtime,
                        finaltime: res.data.finaltime
                    })
                    ConfirmationInterval = setInterval(async ()=>{
                        console.log("post check confirmation")
                        const response = await axios.post(`${this.state.APIendpoint}/confirm`,{negotiationid: res.data.negotiationid})
                        if (response.data.confirmed){
                            clearInterval(ConfirmationInterval)
                            this.setState({
                                convey: response.data.convey,
                                receive: response.data.receive,
                                confirmed: response.data.confirmed,
                                considerationlist: res.data[this.state.party].considerationlist,
                                considerationsubmited: res.data[`${this.state.party}consideration`],
                                stage: response.data.stage,
                                final: response.data.final,
                                result: response.data.result,
                                confirmtime: response.data.confirmtime,
                                finaltime: response.data.finaltime
                            })
                        }
                    },1000)
                }
              }
            }).catch(err=>{
                console.log(err)
            })
        }
    }
    proceedToStages = () =>{
        axios.post(`${this.state.APIendpoint}/stage`,{negotiationid:this.state.negotiationid})
        .then(res => {
          if (res.data ){
            console.log(res.error)
            if(res.data.error){
                this.setState({
                    error: res.data.error
                })
            }else{
                this.setState({
                    negotiationid: res.data.negotiationid, 
                    convey: res.data.convey ? res.data.convey : {}, 
                    receive: res.data.receive ? res.data.receive : {},
                    stage: res.data.stage,
                    considerationlist: res.data[this.state.party].considerationlist,
                    considerationsubmited: res.data[`${this.state.party}consideration`],
                    final: res.data.final,
                    result: res.data.result,
                    confirmtime: res.data.confirmtime
                })
                CountdownInterval = setInterval(()=>{
                    this.setState({countdowna : this.displayCountdown(res.data.confirmtime, 45)})
                },1000)
            }
          }
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
        const unfinished = this.state.considerationlist.filter((cons)=>{
            return cons.choice === undefined
        })
        if(unfinished && unfinished.length >0){
            this.setState({error: `Please complete all questions before submission`})
        }else{
            const body = {
                negotiationid : this.state.negotiationid,
                [this.state.party]: {
                    considerationlist: this.state.considerationlist
                }
            }
            axios.post(`${this.state.APIendpoint}/consideration`,body).then(res => {
              if (res.data ){
                if(res.data.error){
                    this.setState({
                        error: res.data.error
                    })
                }
                this.setState({
                    negotiationid: res.data.negotiationid, 
                    convey: res.data.convey ? res.data.convey : {}, 
                    receive: res.data.receive ? res.data.receive : {},
                    confirmed: res.data.confirmed,
                    stage: res.data.stage,
                    considerationsubmited: res.data[`${this.state.party}consideration`],
                    final: res.data.final,
                    confirmtime: res.data.confirmtime,
                    finaltime: res.data.finaltime
                })
                clearInterval(CountdownInterval)
                ConfirmationInterval = setInterval(async ()=>{
                    console.log("consideration check confirmation")
                    const response = await axios.post(`${this.state.APIendpoint}/confirm`,{negotiationid: res.data.negotiationid})
                    if (response.data.stage >= 3){
                        clearInterval(ConfirmationInterval)
                        this.setState({
                            stage: response.data.stage,
                            final: response.data.final,
                            confirmtime: response.data.confirmtime,
                            finaltime: response.data.finaltime
                        })
                        CountdownInterval = setInterval(()=>{
                            this.setState({countdownb : this.displayCountdown(res.data.finaltime, 10)})
                        },1000)
                    }
                },1000)
              }
            }).catch(err=>{
                console.log(err)
            })
        }
    }

    onDecisionSubmit =(e) =>{
        if(!this.state.decision || (this.state.decision !== "reject" && this.state.decision !== "accept")){
            this.setState({error: `Please complete your preference before submission`})
        }else{
            const body = {
                negotiationid : this.state.negotiationid,
                [`${this.state.party}decision`]: this.state.decision
            }
            axios.post(`${this.state.APIendpoint}/decision`,body)
            .then(res => {
            if (res.data ){
                if(res.data.error){
                    this.setState({
                        error: res.data.error
                    })
                }
                clearInterval(CountdownInterval)
                this.setState({
                    stage: res.data.stage,
                    final: res.data.final,
                    result: res.data.result
                })
                ConfirmationInterval = setInterval(async ()=>{
                    console.log("decision check confirmation")
                    const response = await axios.post(`${this.state.APIendpoint}/confirm`,{negotiationid: res.data.negotiationid})
                    if (response.data.stage === 4){
                        clearInterval(ConfirmationInterval)
                        this.setState({
                            stage: response.data.stage,
                            final: response.data.final,
                            result: response.data.result
                        })
                    }
                },1000)
            }
            }).catch(err=>{
                console.log(err)
            })
        }
    }

    render(){
        const {party, caseid, currency, conveyprice, receiveprice, timed, error} = this.state
        return (
            <Layout>
              <Head>
                <title>{siteTitle}</title>
              </Head>
                {!this.state.negotiationid && <section className={styles.actual}>
                    <div className={styles.topform}>
                        <div className={styles.toggle}>
                            <p>For this case, I am the: </p>
                            <input type="radio" name="sizeBy" value="convey" id="convey" className={classNames({[styles.checked]:party==="convey"})}/>
                            <label htmlFor="convey"onClick={()=>this.setValue("party", "convey")} >Convey Party</label>
                            <input type="radio" name="sizeBy" value="receive" id="receive" className={classNames({[styles.checked]:party==="receive"})}/>
                            <label htmlFor="receive" onClick={()=>this.setValue("party", "receive")} >Receive Party</label>
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
                        <div>
                            <h4>Receive Party data entry</h4>
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
                    <hr/>
                    <div className={styles.bottomform}>
                    <form>
                        <div className={styles.formgroup}>
                            <label htmlFor="currency">1. Currency</label>
                            <select id="currency" name="currency" value = {currency} onChange={(e)=>this.setValue("currency", e.target.value)}   >
                                <option value="">Please Select ... </option>
                                <option value="USD">United States dollar </option>
                                <option value="CAD">Canadia dollar</option>
                                <option value="EUR">Euro</option>
                                <option value="JPY">Japan</option>
                                <option value="GBP">Great Britain pound</option>
                                <option value="AUD">Australia dollar</option>
                            </select>
                        </div>
                        <div className={styles.formgroup}>
                            <label htmlFor="conveyprice">2. Convey Party Claim</label>
                            <input value = {conveyprice} onChange={(e)=>this.setValue("conveyprice",e.target.value)}  type="number" id="conveyprice" name="conveyprice" placeholder="Amount (subject to contingencies) Convey Party is willing to allocate to Receive Party"/>
                        </div>
                        <div className={styles.formgroup}>
                            <label htmlFor="receiveprice">3. receive Party Claim</label>
                            <input  value = {receiveprice} onChange={(e)=>this.setValue("receiveprice",e.target.value)} type="number" id="receiveprice" name="receiveprice" placeholder="Amount (subject to contingencies) Receive Party is willing to receive from Convey Party"/>
                        </div>
                        <div className={styles.formgroup}>
                            <label htmlFor="receiveprice">4. Start Time calendared</label>
                            <div className={styles.switch} onClick={()=>this.setValue("timed", !timed)} >
                                <input id="timed" name="timed" type="checkbox"/>
                                <span className={styles.slider}className={classNames(styles.slider,{[styles.checked]:timed})}></span>
                            </div>
                        </div>
                        {error && <p className={styles.errorMessage}>{error}</p>}
                        Within a reasonable time frame from one another, both parties shall <span className={styles.submit} onClick={()=>this.postCase()}>CLICK HERE</span> to proceed to the Verification module.
                    </form>
                    </div>
                </section>
                }        
                {this.state.negotiationid && this.state.stage === 0 && <section className={styles.verification}>

                <h4>Numeric Key: {this.state.negotiationid}</h4>
                <ul>
                    <li>
                    Provide the above 12 character Numeric Key to the Receive Party via: text / e-mail / fax
                    </li>
                    <li>
                    Has the Receive Party entered the Numeric Key allowing the System to connect the parties?    NO
                    </li>
                    <li>
                    When the above NO changes to YES, CLICK HERE to view the updated Verify column
                    </li>
                    <li>
                    As per FAQ number 5, both parties shall abandon this claim currently in progress and shall begin a new case at a time frame that is mutually convenient
                    </li>
                </ul>
                <div className={styles.tablecontainer}>
                    <table>
                    <thead>
                    <tr>
                        <th className={styles.title} colSpan="4">Convey Party Verification</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <th>Claim Variables</th>
                        <th>Convey Party Entry</th>
                        <th>Receive Party Entry</th>
                        <th>Verify</th>
                    </tr>
                    <tr>
                        <td>1. Currency</td>
                        <td>{this.state.convey.currency || "Pending"}</td>
                        <td>{this.state.receive.currency || "Pending"}</td>
                        <td>{this.state.convey.currency === this.state.receive.currency ? "Match" : "Unmatch"}</td>
                    </tr>
                    <tr>
                        <td>2. Convey Party Claim</td>
                        <td>{this.state.convey.conveyprice || "Pending"}</td>
                        <td>{this.state.receive.conveyprice || "Pending"}</td>
                        <td>{this.state.convey.currency === this.state.receive.currency ? "Match" : "Unmatch"}</td>
                    </tr>
                    <tr>
                        <td>3. Receive Party Claim</td>
                        <td>{this.state.convey.receiveprice || "Pending"}</td>
                        <td>{this.state.receive.receiveprice || "Pending"}</td>
                        <td>{this.state.convey.receiveprice === this.state.receive.receiveprice ? "Match" : "Unmatch"}</td>
                    </tr>
                    <tr>
                        <td>4. Start Time Calendared</td>
                        <td>{this.state.convey.timed ? this.booleanToString(this.state.convey.timed) : "Pending"}</td>
                        <td>{this.state.receive.timed ? this.booleanToString(this.state.convey.timed)  : "Pending"}</td>
                        <td>{this.state.convey.timed === this.state.receive.timed ? "Match" : "Unmatch"}</td>
                    </tr>

                </tbody>
                </table>
                </div>
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
                            {error && <p className={styles.errorMessage}>{error}</p>}

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
                                {error && <p className={styles.errorMessage}>{error}</p>}
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