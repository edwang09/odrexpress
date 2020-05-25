import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import styles from './admin.module.scss'
import Link from 'next/link'
import React, {useState} from 'react'
import axios from 'axios'
import { Editor } from '@tinymce/tinymce-react'; 
// const TABS = ["about", "faq", "contact", "termofuse", "privacypolicy"]
const APIendpoint = process.env.APIendpoint

export default class Admin extends React.Component {
  state = {
    username:"admin",
    password:"BIG#cake3",
    verified:true,
    tab: "currency",
    content:"choose from above tabs",
    error : "",
    currency:[]
  }
  setValue = (name, value) =>{
    return this.setState({[name]:value})
  }
  switchTab= (tab) =>{
    switch (tab) {
      case "currency":
        axios.get(`${APIendpoint}/currency`).then(res => {
          if (res.data ){
              console.log(res.data)
              this.setState({currency:res.data.currency, tab},()=>{
                // console.log(this.state.content.substr(0,10))
              })
          }
        }).catch(err=>{
          console.log(err)
        })
        break;
    
      default:
        axios.get(`${APIendpoint}/content?page=${tab}`).then(res => {
          if (res.data ){
              console.log(res.data)
              this.setState({content:res.data.content, tab},()=>{
                // console.log(this.state.content.substr(0,10))
              })
          }
        }).catch(err=>{
          this.setState({content:""})
        })
        break;
    }
  }
  login = () => {
    const body = {
      username : this.state.username, 
      password : this.state.password
    }
    console.log(body)
    axios.post(`${APIendpoint}/login`,body).then((res)=>{
      console.log(res)
      if (res.data.error){
        this.setState({error: res.data.error})
      }else{
        this.setState({verified:true})
      }
    }).catch(err=>console.log(err))
  }
  handleEditorChange = (e) => {
    // console.log(this.state.content.substr(0,10))
    // console.log(e.target.getContent().substr(0,10))
    this.setState({content:e.target.getContent()})
  }
  submitpost = () =>{
      const page = this.state.tab
      const body = {
          username : this.state.username, 
          password : this.state.password,
          page,
          content: this.state.content
      }
      console.log(body)
      axios.post(`${APIendpoint}/content`,body).then(res => {
          if (res.data ){
              console.log(res.data)
          }
      }).catch(err=>{
          console.log(err)
      })
  }
  setCurrency = (id, prop, value) =>{
    const currency = this.state.currency.map((cur,idx)=>{
      if (idx===id){
        return {...cur, [prop]:value}
      }
      return cur
    })
    this.setState({currency})
  }
  addCurrency = () =>{
    this.setState({currency:[...this.state.currency, {name:"", symbol:""}]})
  }
  removeCurrency = (id) =>{
    const currency = this.state.currency.filter((cur,idx)=>idx!==id)
    this.setState({currency})
  }
  submitCurrency = (id) =>{
      const body = {
          username : this.state.username, 
          password : this.state.password,
          currency: this.state.currency
      }
      axios.post(`${APIendpoint}/currency`,body).then(res => {
          if (res.data ){
              console.log(res.data)
          }
      }).catch(err=>{
          console.log(err)
      })
  }
  render(){
    const currencyRender=this.state.currency.map((cur,id)=>{
      return (
        <div className={styles.currencyitem}>
          <input type="text" value={cur.symbol} className={styles.symbol} onChange={(e)=>this.setCurrency(id,"symbol", e.target.value)}/>
          <input type="text" value={cur.name}  className={styles.name} onChange={(e)=>this.setCurrency(id,"name", e.target.value)}/>
          <button onClick={()=>this.removeCurrency(id)}>Remove</button>
        </div>
      )
    })
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
          <button type="submit" default="true" onClick={()=>this.login()}>Submit</button>
        </div>}
        {this.state.verified &&
        <div className={styles.editor}>
          <ul className={styles.navigator}>
            <li>
              <a onClick={()=>this.switchTab("about")}>About</a>
            </li>
            <li>
              <a onClick={()=>this.switchTab("faq")}>FAQ</a>
            </li>
            <li>
              <a onClick={()=>this.switchTab("contacts")}>Contacts</a>
            </li>
            <li>
              <a onClick={()=>this.switchTab("termofuse")}>Term of Use</a>
            </li>
            <li>
              <a onClick={()=>this.switchTab("privacypolicy")}>Privacy Policy</a>
            </li>
            <li>
              <a onClick={()=>this.switchTab("currency")}>Currency</a>
            </li>
            {/* <li>
              <a disabled={true} onClick={()=>this.switchTab("settings")}>Settings</a>
            </li> */}
          </ul>
            {(this.state.tab !== "currency" && this.state.tab !== "settings") && 
            <div value = {this.state.content}>
            <button className={styles.submitchange} onClick={()=>this.submitpost()}>Submit Change</button>
              <Editor
                apiKey="fpo6y1yt39ze8vwmfh1q36efo0atodl5wfv98vunq39cmz2o"
                value = {this.state.content}
                initialValue=''
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
            }
            {(this.state.tab === "currency") && 
              (
                <div className={styles.currencylist}>
                  <div className={styles.currencyhead}>
                    <p className={styles.symbol}>Symbol</p>
                    <p className={styles.name}>Name</p>
                  </div>
                  {currencyRender}
                  <div className={styles.actions}>
                    <button onClick={()=>this.addCurrency()}>Add new</button>
                    <button onClick={()=>this.submitCurrency()}>Submit</button>
                  </div>
                </div>
              )
            }
        </div>

        }
  
      </Layout>
    )
  }
  
}