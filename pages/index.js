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
        <div className={styles.advantage}>
          <h5>Advantages</h5>
          <p>An exceedingly logical and user friendly methodology that provides:  Government Agencies  /  Individuals  / Business / with:</p>
          <ul>
            <li>
              No Registration format
            </li>
            <li>
            Very high degree of privacy
            </li>
            <li>
            Keyboard venue (anytime / anywhere)
            </li>
          </ul>
        </div>
        <div className={styles.document}>
        <h5>Document Reduction</h5>
          <p>This system has been formatted to effectually minimize the requirement for paperwork frequently associated with dispute resolution.</p>
          <p>Our Non-Binding Recommendation (NBR) is facilitated as a concluding resolution for each case.</p>
        </div>
        <div className={styles.expedition}>
        <h5>Expeditious</h5>
          <p>A procedure offering an efficient 3 step process.Results are obtained in less then one hour.</p>
          <ul>
            <li>
              ENTER the numeric amount of the claims
            </li>
            <li>
              CLICK through a display of generated sums
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