import styles from './matchtable.module.scss'
import classNames from 'classnames';
import React, { useState } from 'react';
import Matchtablerow from './matchtablerow'


export default function Matchtable(props){
    const displayparty = props.party.charAt(0).toUpperCase() + props.party.slice(1)
    return (
        <div className= {styles.tablecontainer}>
        <table>
            <thead>
                <tr>
                    <th className={styles.title} colSpan="4">{displayparty} Party Verification</th>
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
                    <td><span>1.</span><span>Currency</span></td>
                    <td><Matchtablerow style = {{textTransform: "uppercase"}} form = {props.form.currency} convey = {props.convey.currency} receive = {props.receive.currency} party={props.party} column = {"convey"} setValue={(value)=>props.setValue("currency", value)}/></td>
                    <td><Matchtablerow style = {{textTransform: "uppercase"}} form = {props.form.currency} convey = {props.convey.currency} receive = {props.receive.currency} party={props.party} column = {"receive"} setValue={(value)=>props.setValue("currency", value)}/></td>
                    <td><Matchtablerow convey = {props.convey.currency} receive = {props.receive.currency} party={props.party} column = {"match"} editCase={()=>props.editCase("currency")}/></td>
                </tr>
                <tr>
                    <td><span>2.</span><span>Convey Party negotiable claim</span></td>
                    <td><Matchtablerow form = {props.form.conveyprice} convey = {props.convey.conveyprice} formatCurrency = {props.formatCurrency} receive = {props.receive.conveyprice} party={props.party} column = {"convey"} setValue={(value)=>props.setValue("conveyprice", value)}/></td>
                    <td><Matchtablerow form = {props.form.conveyprice} convey = {props.convey.conveyprice} formatCurrency = {props.formatCurrency} receive = {props.receive.conveyprice} party={props.party} column = {"receive"} setValue={(value)=>props.setValue("conveyprice", value)}/></td>
                    <td><Matchtablerow convey = {props.convey.conveyprice} receive = {props.receive.conveyprice} party={props.party} column = {"match"} editCase={()=>props.editCase("conveyprice")}/></td>
                </tr>
                <tr>
                    <td><span>3.</span><span>Receive Party negotiable claim</span></td>
                    <td><Matchtablerow form = {props.form.receiveprice} convey = {props.convey.receiveprice} formatCurrency = {props.formatCurrency} receive = {props.receive.receiveprice} party={props.party} column = {"convey"} setValue={(value)=>props.setValue("receiveprice", value)}/></td>
                    <td><Matchtablerow form = {props.form.receiveprice} convey = {props.convey.receiveprice} formatCurrency = {props.formatCurrency} receive = {props.receive.receiveprice} party={props.party} column = {"receive"} setValue={(value)=>props.setValue("receiveprice", value)}/></td>
                    <td><Matchtablerow convey = {props.convey.receiveprice} receive = {props.receive.receiveprice} party={props.party} column = {"match"} editCase={()=>props.editCase("receiveprice")}/></td>
                </tr>
                <tr>
                    <td><span>4.</span><span>Start Time Calendared</span></td>
                    <td><Matchtablerow form = {props.form.timed} convey = {props.convey.timed} receive = {props.receive.timed} party={props.party} column = {"convey"} setValue={(value)=>props.setValue("timed", value)}/></td>
                    <td><Matchtablerow form = {props.form.timed} convey = {props.convey.timed} receive = {props.receive.timed} party={props.party} column = {"receive"} setValue={(value)=>props.setValue("timed", value)}/></td>
                    <td><Matchtablerow convey = {props.convey.timed} receive = {props.receive.timed} party={props.party} column = {"match"} editCase={()=>props.editCase("timed")}/></td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <th className={classNames(styles.proceed, {[styles.disabled]: props.disabled})} colSpan="4"
                        onClick={()=>props.onProceed()}
                    >Proceed to the secure Payment Gateway</th>
                </tr>
            </tfoot>
        </table>
        </div>
    )
}