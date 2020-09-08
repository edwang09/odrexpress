import Link from 'next/link'
import style from './consideration.module.scss'
import classNames from 'classnames';
import React, { useState } from 'react';


export default function Consideration(props){
    return (
        <div  className={classNames([style.consideration,{[style.current]: props.current, [style.previous]: props.previous, [style.next]: props.next}])}>
            <h4>Consideration {props.id+1} of 18: </h4>
            <h4>Would you give consideration to a {props.currency} settlement in the amount of {props.amount}</h4>
            <div className={style.inputGroup}>
                <input id={`consideration${props.id}-0`} name="0" type="radio" onChange={props.onChange} checked = {props.choice == 0} className={classNames([{[style.checked]: props.choice == 0}])}/>
                <label htmlFor={`consideration${props.id}-0`}>Under no circumstances would I consider this sum.</label>
            </div>
            <div className={style.inputGroup}>
                <input id={`consideration${props.id}-1`} name="1" type="radio"  onChange={props.onChange} checked = {props.choice == 1} className={classNames([{[style.checked]: props.choice == 1}])}/>
                <label htmlFor={`consideration${props.id}-1`}>I would give this sum the least amount of consideration</label>
            </div>
            <div className={style.inputGroup}>
                <input id={`consideration${props.id}-2`} name="2" type="radio"  onChange={props.onChange} checked = {props.choice == 2} className={classNames([{[style.checked]: props.choice == 2}])}/>
                <label htmlFor={`consideration${props.id}-2`}>I would give this sum a minor amount of consideration</label>
            </div>
            <div className={style.inputGroup}>
                <input id={`consideration${props.id}-3`} name="3" type="radio" onChange={props.onChange} checked = {props.choice == 3} className={classNames([{[style.checked]: props.choice == 3}])}/>
                <label htmlFor={`consideration${props.id}-3`}>I would give this sum a fair amount of consideration</label>
            </div>
        </div>
    )
}