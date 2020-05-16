import Link from 'next/link'
import style from './consideration.module.scss'
import classNames from 'classnames';
import React, { useState } from 'react';


export default function Consideration(props){
    return (
        <div  className={classNames([style.consideration,{[style.current]: props.current}])}>
            <h4>{props.id+1} of 18: Would you (as the {props.party} party) give consideration to a settlement in the amount of {props.currency} {props.amount}</h4>
            <div className={style.inputGroup}>
                <input id={`consideration${props.id}-0`} name="0" type="radio" onChange={props.onChange} checked = {props.choice == 0} className={classNames([{[style.checked]: props.choice == 0}])}/>
                <label htmlFor={`consideration${props.id}-0`}>Under no circumstances would we consider this sum.</label>
            </div>
            <div className={style.inputGroup}>
                <input id={`consideration${props.id}-1`} name="1" type="radio"  onChange={props.onChange} checked = {props.choice == 1} className={classNames([{[style.checked]: props.choice == 1}])}/>
                <label htmlFor={`consideration${props.id}-1`}>We would give this sum the least amount of consideration</label>
            </div>
            <div className={style.inputGroup}>
                <input id={`consideration${props.id}-2`} name="2" type="radio"  onChange={props.onChange} checked = {props.choice == 2} className={classNames([{[style.checked]: props.choice == 2}])}/>
                <label htmlFor={`consideration${props.id}-2`}>We would give this sum a minor amount of consideration</label>
            </div>
            <div className={style.inputGroup}>
                <input id={`consideration${props.id}-3`} name="3" type="radio" onChange={props.onChange} checked = {props.choice == 3} className={classNames([{[style.checked]: props.choice == 3}])}/>
                <label htmlFor={`consideration${props.id}-3`}>We would give this sum a fair amount of consideration</label>
            </div>
        </div>
    )
}