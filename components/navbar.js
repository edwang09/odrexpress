import Link from 'next/link'
import { withRouter } from 'next/router'
import style from './navbar.module.scss'
import classNames from 'classnames';
import React, { useState } from 'react';


function Navbar({router}){
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
                        <a className={style.navlink} style={(router.pathname ==="/") ? {fontWeight: "bold"} : {}}>HOME</a>
                    </Link>
                </li>
                <li>
                    <Link href="/pricing">
                        <a className={style.navlink} style={(router.pathname ==="/pricing") ? {fontWeight: "bold"} : {}}>PRICING</a>
                    </Link>
                </li>
                <li>
                    <Link href="/demo">
                        <a className={style.navlink} style={(router.pathname ==="/demo") ? {fontWeight: "bold"} : {}}>DEMO</a> 
                    </Link>
                </li>
                <li>
                    <Link href="/actual">
                        <a className={style.navlink} style={(router.pathname ==="/actual") ? {fontWeight: "bold"} : {}}>ACTUAL</a>
                    </Link>
                </li>
                <li>
                    <Link href="/faq">
                        <a className={style.navlink} style={(router.pathname ==="/faq") ? {fontWeight: "bold"} : {}}>FAQ</a>
                    </Link>
                </li>
            </ul>
        </nav>
        </div>
    )
}
export default withRouter(Navbar)