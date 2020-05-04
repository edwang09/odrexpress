import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import styles from './about.module.scss'



export default function About() {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={styles.about}>
        <h2>ABOUT</h2>
        <h5>News</h5>
        <p>The latest modification to the Terms of Use occurred on March 10, 2020.  </p>
        <p>By using this website, you agree to the Terms of Use in its entirety, including the latest modification.</p>
        <p>If you do not agree to the Terms of Use in its entirety, do not use this website.</p>

        <h5>Pricing</h5>
        <p>ODR EXPRESS provides innovative and cost effective online dispute resolution at the National and International level.</p>
        <p>Pricing is in United States Dollars, 3 letter Currency Code USD.  </p>
        <p>The fee per case is 90 USD for the Convey Party and 90 USD for the Receive Party.</p>

        <h5>Parties</h5>
        <p>The opposing parties are identified as the Convey Party and the Receive Party.</p>
        <p>The Convey Party expresses a contingent willingness to convey monetary compensation to the Receive Party.</p>
        <p>The Receive Party expresses a contingent willingness to receive monetary compensation from the Convey Party.</p>
        <p>To utilize the ODR EXPRESS process, one Convey Party and one Receive Party are mandatory.</p>

        <h5>Actual Case Attributes</h5>
        <p>Verification of the initial Claims occurs near the start of an Actual dispute. </p>
        <p>Countdowns enable the dispute resolution process to advance in an expeditious manner.</p>
        <ul>
            <li>
                Countdown A begins when the 18 Considerations commence.
            </li>
            <li>
                Countdown A provides a maximum 20 minute time allotment for the completion of the 18 Considerations.
            </li>
            <li>
                Both parties completing Countdown A in less than 15 minutes will enable immediate advancement to Countdown B.
            </li>
            <li>
                Countdown B provides 10 minutes for the parties to Accept or Reject the Monetary Analysis
            </li>
        </ul>
        <p>Based upon an Artificial Intelligence analysis of input, a single Non-Binding Recommendation will simultaneously be provided to both parties.</p>

      </section>
    </Layout>
  )
}