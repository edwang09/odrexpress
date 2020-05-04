import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import styles from './faq.module.scss'



export default function Faq() {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={styles.faq}>
        <h2>Frequently Asked Questions</h2>

        <h5>What is the difference between a Claim and a Case?</h5>
        <p>
          A Claim is a presentment made by either one of the disputing parties.
        </p>
        <p>
          A Case is the combined presentment made by both the Convey Party and
          the Receive Party.
        </p>

        <h5>
          What are the key attributes of a Non-Binding Recommendation (NBR)?
        </h5>
        <p>
          At the culmination of our process, the opposing parties are presented
          with a Non Binding Recommendation (NBR).
        </p>
        <p>
          The opposing parties shall then make a determination to Accept or to
          Reject the Non Binding Recommendation (NBR).{" "}
        </p>
        <p>
          The acceptance or rejection shall conclude the Online Dispute
          Resolution (ODR) process.{" "}
        </p>
        <p>
          The ODR EXPRESS fee is earned for each case regardless of the Accept
          or Reject decision.{" "}
        </p>

        <h5>How are Claims categorized?</h5>
        <p>
          The ODR EXPRESS process consists of two parties, the Receive Party and
          the Convey Party. Both the Receive Party and the Convey Party make
          Claims.
        </p>
        <p>
          The party intending to receive a payment is referenced as the Receive
          Party. The party intending to make payment is referenced as the Convey
          Party.
        </p>
        <p>
          The Receive Claim is the amount that the Receive Party claims is due
          from the Convey Party.
        </p>
        <p>
          The Convey Claim is the amount that the Convey Party claims is owed to
          the Receive Party.
        </p>

        <h5>How do Countdowns function for ACTUAL Cases?</h5>
        <p>
          Countdowns enable the resolution process to advance and conclude in an
          expeditious manner.
        </p>
        <p>
          When both parties complete the 18 Considerations, advancement to
          Countdown B will occur automatically.
        </p>
        <ul>
          <li>
            Countdown A provides a maximum 20 minute time allotment for the
            completion of the 18 Considerations.
          </li>
          <li>Countdown A begins when the 18 Considerations commence.</li>
          <li>
            Countdown B provides 10 minutes for the parties to Accept or Reject
            the Monetary Analysis.
          </li>
        </ul>
        <h5>How do Countdowns function for DEMO Cases?</h5>
        <p>
          Countdowns enable the resolution process to advance and conclude in an
          expeditious manner.
        </p>
        <p>
          When both parties complete the 18 Considerations, advancement to
          Countdown B will occur automatically.
        </p>
        <ul>
          <li>
            Countdown A provides a maximum 20 minute time allotment for the
            completion of the 18 Considerations.
          </li>
          <li>Countdown A begins when the 18 Considerations commence.</li>
          <li>
            Countdown B provides 10 minutes for the parties to Accept or Reject
            the Monetary Analysis.
          </li>
        </ul>

        <h5>
          What is the resolution if a typo or miscommunication occurs between
          the opposing parties during their interaction while in the
          Verification module?{" "}
        </h5>
        <p>
          Both parties shall vacate the claim that is currently in progress and
          resume proceedings at a time frame that is mutually convenient.
        </p>
        <p>
          No fee shall be incurred for the abandoned claim, due to the fact that
          the abandoned case never reached the Payment Gateway.{" "}
        </p>
        <p>
          The below ancillary information will be of benefit to both parties:
        </p>
        <ul>
          <li>
            The correct DEMO data entry is preset in the Verification module
            thus mitigating the possibility of an error in that module.
          </li>
          <li>
            The database will recognize conflicts in an ACTUAL case data entry.
          </li>
          <li>
            A message identified by a red bullet point in the Verification
            module will alert both parties to an error.
          </li>
          <li>
            An example of a data entry error would be opposing parties selecting
            different currencies.
          </li>
        </ul>

        <h5>What if one or both parties are not realistic with their claim?</h5>
        <p>
          If either party considers that the opposition is not acting in good
          faith or is unrealistic with their claim, than neither party has an
          obligation to continue.
        </p>
        <p>
          To avoid paying our fee, discontinue with the proceedings prior to
          interaction with the Payment Gateway.
        </p>

        <h5>
          My claim is that the opposing party owes me $810. The opposition is
          claiming that I owe them $790. Why are we unable to initiate this
          claim?
        </h5>
        <p>Both parties CANNOT be RECEIVE parties.</p>
        <p>
          The ODR EXPRESS process requires one Receive party and one Convey
          party.
        </p>
        <p>
          In your specific instance, both parties would be designated as Receive
          Parties.
        </p>
        <p>
          As such, these claims do not meet the requirements necessary to
          participate in the ODR EXPRESS process.
        </p>

        <h5>
          What is the typical policy regarding a Settlement Agreement and
          Releases?
        </h5>
        <p>
          Your question is outside the scope of our capacity. Consult with your
          legal counsel in matters such as this.
        </p>

        <h5>How do the 18 Considerations function? </h5>
        <p>
          Completion by both parties of the Verification module and the Payment
          Gateway will result in automatic advancement to the 18 Considerations.
        </p>
        <ul>
          <li>
            A continuing series (18 displays) of numeric sums will display.
          </li>
          <li>
            Each numeric sum will range between the Convey Party claim and the
            Receive Party claim.
          </li>
          <li>
            The respective parties shall make a Consideration (radio selection)
            as to the feasibility of each monetary amount generated.
          </li>
          <li>
            The monetary amounts generated for one party will differ from the
            sums generated for the opposing party.
          </li>
        </ul>

        <h5>
          How does the Monetary Analysis differ from the Non-Binding
          Recommendation (NBR)?
        </h5>
        <p>
          The Monetary Analysis is the sum derived from both parties’ responses
          to their 18 Considerations.
        </p>
        <p>
          The Non-Binding Recommendation (NBR) consists of ancillary
          requirements that accompany the Monetary Analysis.{" "}
        </p>
      </section>
    </Layout>
  );
}