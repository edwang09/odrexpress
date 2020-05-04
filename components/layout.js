import Head from 'next/head'
import style from './layout.module.scss'
import Link from 'next/link'
import Navbar from './navbar'

export const siteTitle = "DRO Express"
export default function Layout({ children, page }) {
  return (
    <div className={style.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="The mediation App"
        />
        <link href="/fontawesome/css/all.css" rel="styleheet"></link>
        {/* <meta
          property="og:image"
          content={`https://og-image.now.sh/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} /> */}
        {/* <meta name="twitter:card" content="summary_large_image" /> */}
      </Head>
      <header className={style.header}>
          <div className={style.logo}>
            <Link href="/">
                <div className={style.main}>DRO <b>EXPRESS</b></div>
            </Link>
            <div className={style.secondary}>The Mediation App</div>
          </div>
          <Navbar/>
      </header>
      <main>{children}</main>
      <footer className={style.footer}>
        <hr></hr>
        <ul>
          <li>
            <Link href="/privacy">
              <a >Privacy</a>
            </Link>
          </li>
          <li>
            <Link href="/contact">
              <a >Contact</a>
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
          <li>&copy; 2020 ODR EXPRESS Corporation
          </li>
        </ul>
      </footer>
    </div>
  )
}