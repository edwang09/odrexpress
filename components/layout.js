import Head from 'next/head'
import style from './layout.module.scss'
import Link from 'next/link'
import Navbar from './navbar'

export const siteTitle = "ADR Remote"
export default function Layout({ children, page }) {

  return (
    <div className={style.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="The mediation App"
        />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap" rel="stylesheet"></link>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true"/>
        <link href="https://fonts.googleapis.com/css2?family=Baskervville&display=swap" rel="stylesheet"></link>
        <link href="/fontawesome/css/all.css" rel="styleheet"></link>


      </Head>
      <header className={style.header}>
          <div className={style.logo}>
            <Link href="/">
                <div className={style.main}>ADR <b>REMOTE</b></div>
            </Link>
            {/* <div className={style.secondary}>The Online Dispute Resolution App</div> */}
          </div>
          <Navbar/>
      </header>
      <main>{children}</main>
      <footer className={style.footer}>
        <hr></hr>
        <ul>
          <li>
            <Link href="/privacypolicy">
              <a >Privacy Policy</a>
            </Link>
          </li>
          <li>
            <Link href="/contacts">
              <a >Contacts</a>
            </Link>
          </li>
          <li>
            <Link href="/links">
              <a >Links</a>
            </Link>
          </li>
          <li>
            <Link href="/termofuse">
              <a >Term of Use</a>
            </Link>
          </li>
          <li>
            <Link href="/admin">
              <a >Admin</a>
            </Link>
          </li>
          <li>&copy; 2021-2022 ADR REMOTE Corporation
          </li>
        </ul>
      </footer>
    </div>
  )
}