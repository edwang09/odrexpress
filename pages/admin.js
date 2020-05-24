import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import styles from './admin.module.scss'
import Link from 'next/link'
import React, {useState} from 'react'
import axios from 'axios'
import { Editor } from '@tinymce/tinymce-react'; 
const TABS = ["about", "faq", "contact", "termofuse", "privacypolicy"]

export default class Admin extends React.Component {
  state = {
    APIendpoint : "http://localhost:3000/api",
    username:"",
    password:"",
    verified:false,
    tab: 0,
    content:"",
    error : ""
  }
  setValue = (name, value) =>{
    return this.setState({[name]:value})
  }
  switchTab= (tab) =>{
    this.setState({tab},()=>{
      const page = TABS[tab]
      axios.get(`${this.state.APIendpoint}/content?page=${page}`).then(res => {
        if (res.data ){
            console.log(res.data)
            this.setState({content:res.data.content})
        }
      }).catch(err=>{
        this.setState({content:""})
      })
    })
  }
  login = () => {
    const body = {
      username : this.state.username, 
      password : this.state.password
    }
    console.log(body)
    axios.post(`${this.state.APIendpoint}/login`,body).then((res)=>{
      console.log(res)
      if (res.data.error){
        this.setState({error: res.data.error})
      }else{
        this.setState({verified:true})
      }
    }).catch(err=>console.log(err))
  }
  handleEditorChange = (e) => {
      this.setState({content:e.target.getContent()})
  }
  submitpost = () =>{
      const page = TABS[this.state.tab]
      const body = {
          username : this.state.username, 
          password : this.state.password,
          page,
          content: this.state.content
      }
      console.log(body)
      axios.post(`${this.state.APIendpoint}/content`,body).then(res => {
          if (res.data ){
              console.log(res.data)
          }
      }).catch(err=>{
          console.log(err)
      })
  }

  render(){
    return (
      <Layout>
        <Head>
          <title>{siteTitle}</title>
        </Head>
        {!this.state.verified && <div className={styles.loginform}>
          <div className={styles.errormessage}>{this.state.error}</div>
          <div className={styles.formgroup}>
            <label htmlFor="username">Username: </label>
            <input type="text" name="username" id="username" value={this.state.username} 
            onChange={(e)=>this.setValue("username",e.target.value)}/>
          </div>
          <div className={styles.formgroup}>
            <label htmlFor="password">Password: </label>
            <input type="password" name="password" id="password" value={this.state.password} 
            onChange={(e)=>this.setValue("password",e.target.value)}/>
          </div>
          <button onClick={()=>this.login()}>Submit</button>
        </div>}
        {this.state.verified &&
        <div className={styles.editor}>
          <ul className={styles.navigator}>
            <li>
              <a onClick={()=>this.switchTab(0)}>About</a>
            </li>
            <li>
              <a onClick={()=>this.switchTab(1)}>FAQ</a>
            </li>
            <li>
              <a disabled onClick={()=>this.switchTab(2)}>Contact</a>
            </li>
            <li>
              <a onClick={()=>this.switchTab(3)}>Term of Use</a>
            </li>
            <li>
              <a disabled={true} onClick={()=>this.switchTab(4)}>Privacy Policy</a>
            </li>
            <li>
              <a disabled={true} onClick={()=>this.switchTab(5)}>Currency</a>
            </li>
            <li>
              <a disabled={true} onClick={()=>this.switchTab(6)}>Settings</a>
            </li>
          </ul>
            <div>
            <button className={styles.submitchange} onClick={()=>this.submitpost()}>Submit Change</button>
            <Editor
              apiKey="fpo6y1yt39ze8vwmfh1q36efo0atodl5wfv98vunq39cmz2o"
              value = {this.state.content}
              init={{
                height: 500,
                menubar: false,
                plugins: [
                  'advlist autolink lists link image', 
                  'charmap print preview anchor help',
                  'searchreplace visualblocks code',
                  'insertdatetime media table paste wordcount'
                ],
                toolbar:
                  'undo redo | formatselect | bold italic | \
                  alignleft aligncenter alignright | \
                  bullist numlist outdent indent | help'
              }}
              onChange={this.handleEditorChange}
            />
            </div>
        </div>

        }
  
      </Layout>
    )
  }
  
}