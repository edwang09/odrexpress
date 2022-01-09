import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import styles from './index.module.scss'


export default function Home() {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={styles.banner}>
        <img src="/images/banner.jpg" alt="banner"/>
      </section>
      <section className={styles.catches}>
        <div className={styles.synopsis}>
          <h5>Synopsis</h5>
          <p>ADR REMOTE is a world wide provider of innovative and cost effective Online Dispute Resolution services for:</p>
          <ul>
            <li>
            Businesses
            </li>
            <li>
            Individuals
            </li>
            <li>
            Government Agencies
            </li>
          </ul>
        </div>
        <div className={styles.advantages}>
        <h5>Advantages</h5>
          <p>ADR REMOTE is a highly logical and exceptionally easy to navigate system that provides participants with:  </p>
          <ul>
            <li>
            No Registration format
            </li>
            <li>
            High degree of privacy
            </li>
            <li>
            Keyboard venue (anytime / anywhere)
            </li>
          </ul>
        </div>
        <div className={styles.efficient}>
        <h5>Efficient</h5>
          <p>ADR REMOTE offers a three step User Friendly process that has the ability to provide results in less then one hour.</p>
          <ul>
            <li>
            ENTER the numeric value of the claims
            </li>
            <li>
            CLICK through a display of computer generated sums
            </li>
            <li>
            VIEW the Application based recommendation
            </li>
          </ul>
        </div>
      </section>
    </Layout>
  )
}