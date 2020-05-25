import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import styles from './about.module.scss'
import React from 'react';
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
export default function About({ content }) {
  return (
    <Layout>
        <Head>
          <title>{siteTitle}</title>
        </Head>
      <section className={styles.about}>
        <h2>About</h2>
          <div dangerouslySetInnerHTML={{__html: content}}></div>
      </section>
    </Layout>
  )
}