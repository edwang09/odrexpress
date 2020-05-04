import Link from 'next/link'
import style from './navbar.module.scss'
import classNames from 'classnames';
import React, { useState } from 'react';


export default function Navbar(){
    const [shownav, setShownav] = useState(false) 
    return (
        <div>
        <div onClick={()=>setShownav(false)} className={classNames(style.overlay, {[style.shownav]:shownav})}></div>
        <nav className={style.navbar}>
            <span onClick={()=>setShownav(!shownav)} className={classNames(style.toggle, {[style.shownav]:shownav})} >
                <div className={style.menubar}></div>
                <div className={style.menubar}></div>
                <div className={style.menubar}></div>
            </span>
            <ul className={classNames(style.mainnav, {[style.active]:shownav})}>
                <li>
                    <Link href="/">
                        <a className={style.navlink}>HOME</a>
                    </Link>
                </li>
                <li>
                    <Link href="/about">   
                        <a className={style.navlink}>ABOUT</a>
                    </Link>
                </li>
                <li>
                    <Link href="/demo">
                        <a className={style.navlink}>DEMO</a> 
                    </Link>
                </li>
                <li>
                    <Link href="/actual">
                        <a className={style.navlink}>ACTUAL</a>
                    </Link>
                </li>
                <li>
                    <Link href="/faq">
                        <a className={style.navlink}>FAQ</a>
                    </Link>
                </li>
            </ul>
        </nav>
        </div>
    )
}