import Link from 'next/link'
import style from './considerationbox.module.scss'
import Consideration from './consideration'
import classNames from 'classnames';
import React, { useState } from 'react';


export default function Considerationbox(props){
    const ConsiderationList = props.considerationlist.map((consideration,id)=>{
        let amount = consideration.amount.toString();
        const pattern = /(-?\d+)(\d{3})/;
        while (pattern.test(amount)){
            amount = amount.replace(pattern, "$1,$2");
        } 

        return (
            <Consideration 
                current = {props.currentquestion === id}
                previous = {props.currentquestion > id}
                next = {props.currentquestion < id}
                choice = {consideration.choice} 
                onChange={props.onConsiderationChoose}
                id = {id} 
                amount={amount} 
                currency = {props.currency} 
                party={props.party}
            />
        )
    })

    return (
        <div className={style.considerationbox}>
            
            <div className={style.considerationlist}>
                {ConsiderationList}
            </div>
        <hr/>
        <div className={style.buttons}>
            <button disabled={props.currentquestion===0} onClick={props.onPrevious}>Previous</button>
            {props.currentquestion !== 17 && <button onClick={props.onNext} disabled={props.considerationlist[props.currentquestion].choice === undefined}>Next</button>}
            {props.currentquestion === 17 &&<button onClick={props.onSubmit} disabled={props.considerationlist[17].choice === undefined}>Submit</button>}
        </div>
        </div>

    )
}