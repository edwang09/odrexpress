import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import styles from './termofuse.module.scss'
import axios from 'axios'
const APIendpoint = process.env.APIendpoint
// import fs from 'fs'
// import path from 'path'
import { MongoClient } from 'mongodb';
const client = new MongoClient('mongodb+srv://admin:ti21sNLGy1NuJ5s1@cluster0-8fgyu.mongodb.net/test?retryWrites=true&w=majority', {
  useUnifiedTopology: true,
  useNewUrlParser: true
});



export async function getStaticProps() {
  // const content = await (await axios.get(`${APIendpoint}/content?page=termofuse`)).data.content
  // const fullPath = path.join(process.cwd(), "admin", "termofuse")
  // const fileContents = fs.readFileSync(fullPath, "utf8")
  // return {props:{ content: fileContents }}
  
  // const result = await axios.get(`${APIendpoint}/content?page=termofuse`)

  if (!client.isConnected()) {
    await client.connect()
  };
  const content = (await client.db('odrexpress').collection('content').findOne({name:"termofuse"})).content
  return {props:{ content }}
}
export default function Termofuse({ content }) {
  return (
    <Layout>
        <Head>
          <title>{siteTitle}</title>
        </Head>
      <section className={styles.termofuse}>
        <h2>Term of Use</h2>
          <div dangerouslySetInnerHTML={{__html: content}}></div>
      </section>
    </Layout>
  )
}