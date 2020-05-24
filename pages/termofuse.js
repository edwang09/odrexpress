import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import styles from './termofuse.module.scss'
import axios from 'axios'
const APIendpoint = process.env.APIendpoint
// import fs from 'fs'
// import path from 'path'



export async function getStaticProps() {
  // const content = await (await axios.get(`${APIendpoint}/content?page=termofuse`)).data.content
  // const fullPath = path.join(process.cwd(), "admin", "termofuse")
  // const fileContents = fs.readFileSync(fullPath, "utf8")
  // return {props:{ content: fileContents }}
  
  const result = await axios.get(`${APIendpoint}/content?page=termofuse`)
  return {props:{ content: result.data.content }}
}
export default function Termofuse({ content }) {
  return (
    <Layout>
        <Head>
          <title>{siteTitle}</title>
        </Head>
      <section className={styles.termofuse}>
        <h2>Frequently Asked Questions</h2>
          <div dangerouslySetInnerHTML={{__html: content}}></div>
      </section>
    </Layout>
  )
}