import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import styles from './pricing.module.scss'
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
 
  if (!client.isConnected()) {
    await client.connect()
  };
  const content = (await client.db('odrexpress').collection('content').findOne({name:"pricing"})).content
  return {props:{ content }}
}
export default function Pricing({ content }) {
  return (
    <Layout>
        <Head>
          <title>{siteTitle}</title>
        </Head>
      <section className={styles.pricing}>
          <div dangerouslySetInnerHTML={{__html: content}}></div>
      </section>
    </Layout>
  )
}