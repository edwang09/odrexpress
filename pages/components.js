import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import styles from './components.module.scss'
import React from 'react';
import axios from 'axios'
const APIendpoint = process.env.APIendpoint
// import fs from 'fs'
// import path from 'path'
import { MongoClient } from 'mongodb';
const client = new MongoClient(process.env.MONGO_CLIENT, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
export async function getServerSideProps() {
  // const content = await (await axios.get(`${APIendpoint}/content?page=about`)).data.content
  // const fullPath = path.join(process.cwd(), "admin", "about")
  // const fileContents = fs.readFileSync(fullPath, "utf8")
  
  // const result = await axios.get(`${APIendpoint}/content?page=about`)
  
  if (!client.isConnected()) {
    await client.connect()
  };
  const content = (await client.db('odrexpress').collection('content').findOne({name:"about"})).content
  return {props:{ content }}
}
export default function Components({ content }) {
  return (
    <Layout>
        <Head>
          <title>{siteTitle}</title>
        </Head>
      <section className={styles.about}>
        <h2>Components</h2>
          <div dangerouslySetInnerHTML={{__html: content}}></div>
      </section>
    </Layout>
  )
}