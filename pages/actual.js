import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import styles from './actual.module.scss'
import classNames from 'classnames';
import React, { useState } from 'react';
import axios from 'axios'


export default class HelloWorld extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
             APIendpoint : "http://localhost:3000/api",
             stage: "",
             party: "convey",
             caseid: "",
             conveyClaim: "",
             receiveClaim: "",
             currency: undefined,
             timed: false,
             negotiationid: "",
             confirmed: false,
        }
    }
    booleanToString = (bool)=>{
        return bool ? "True" : "False"
    }
    
    setValue = (name, value) =>{
        return this.setState({[name]:value})
    }
    postCase = () =>{
        const body = {
            negotiationid : this.state.caseid,
            [this.state.party]: {
                currency: this.state.currency,
                conveyClaim: this.state.conveyClaim,
                receiveClaim: this.state.receiveClaim,
                timed: this.state.timed
            }
        }
        console.log(body)
        axios.post(`${this.state.APIendpoint}/negotiation`,body)
        .then(res => {
            console.log(res)
        
          if (res.data ){
            console.log(res.error )
            if(res.data.error){
                this.setState({
                    error: res.data.error
                })
            }
            this.setState({
                negotiationid: res.data.negotiationid, 
                convey: res.data.convey ? res.data.convey : {}, 
                receive: res.data.receive ? res.data.receive : {}
            })
          }
        }).catch(err=>{
            console.log(err)
        })
    }
    render(){
        const {party, caseid, currency, conveyClaim, receiveClaim, timed, error} = this.state
        return (
            <Layout>
              <Head>
                <title>{siteTitle}</title>
              </Head>
                {!this.state.negotiationid && <section className={styles.actual}>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <div className={styles.topform}>
                    <div className={styles.toggle}>
                        <p>For this case, I am the: </p>
                        <input type="radio" name="sizeBy" value="convey" id="convey" className={classNames({[styles.checked]:party==="convey"})}/>
                        <label htmlFor="convey"onClick={()=>this.setValue("party", "convey")} >Convey Party</label>
                        <input type="radio" name="sizeBy" value="receive" id="receive" className={classNames({[styles.checked]:party==="recieve"})}/>
                        <label htmlFor="receive" onClick={()=>this.setValue("party", "recieve")} >Receive Party</label>
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
                        <label htmlFor="conveyclain">2. Convey Party Claim</label>
                        <input value = {conveyClaim} onChange={(e)=>this.setValue("conveyClaim",e.target.value)}  type="number" id="conveyclain" name="conveyclain" placeholder="Amount (subject to contingencies) Convey Party is willing to allocate to Receive Party"/>
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="receiveclaim">3. Recieve Party Claim</label>
                        <input  value = {receiveClaim} onChange={(e)=>this.setValue("receiveClaim",e.target.value)} type="number" id="receiveclaim" name="receiveclaim" placeholder="Amount (subject to contingencies) Receive Party is willing to receive from Convey Party"/>
                    </div>
                    <div className={styles.formgroup}>
                        <label htmlFor="receiveclaim">4. Start Time calendared</label>
                        <div className={styles.switch} onClick={()=>this.setValue("timed", !timed)} >
                            <input id="timed" name="timed" type="checkbox"/>
                            <span className={styles.slider}className={classNames(styles.slider,{[styles.checked]:timed})}></span>
                        </div>
                    </div>
                    Within a reasonable time frame from one another, both parties shall <span className={styles.submit} onClick={()=>this.postCase()}>CLICK HERE</span> to proceed to the Verification module.
                </form>
                </div>
              </section>}
            
                {this.state.negotiationid && !this.state.confirmed && <section className={styles.verification}>

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
                
                <table id="customers">
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
                        <td>{this.state.convey.conveyClaim || "Pending"}</td>
                        <td>{this.state.receive.conveyClaim || "Pending"}</td>
                        <td>{this.state.convey.currency === this.state.receive.currency ? "Match" : "Unmatch"}</td>
                    </tr>
                    <tr>
                        <td>3. Receive Party Claim</td>
                        <td>{this.state.convey.receiveClaim || "Pending"}</td>
                        <td>{this.state.receive.receiveClaim || "Pending"}</td>
                        <td>{this.state.convey.receiveClaim === this.state.receive.receiveClaim ? "Match" : "Unmatch"}</td>
                    </tr>
                    <tr>
                        <td>4. Start Time Calendared</td>
                        <td>{this.state.convey.timed ? this.booleanToString(this.state.convey.timed) : "Pending"}</td>
                        <td>{this.state.receive.timed ? this.booleanToString(this.state.convey.timed)  : "Pending"}</td>
                        <td>{this.state.convey.timed === this.state.receive.timed ? "Match" : "Unmatch"}</td>
                    </tr>

                </tbody>
                </table>
                </section>

                
                
                
                
                
                
                }
            
            
            </Layout>
          )

    }
  
}