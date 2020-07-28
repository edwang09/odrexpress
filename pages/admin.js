import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import Currencyadmin from "../components/currencyadmin"
import styles from './admin.module.scss'
import Link from 'next/link'
import React, {useState} from 'react'
import axios from 'axios'
import { Editor } from '@tinymce/tinymce-react'; 
import classNames from 'classnames'
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
        this.setState({tab})
        break;
      case "setting":
        axios.get(`${APIendpoint}/setting`).then(res => {
          if (res.data ){
              console.log(res.data)
              this.setState({setting:res.data.setting.setting, tab},()=>{
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
  submitCurrency = (currency) =>{
    console.log("save currency")
      const body = {
          username : this.state.username, 
          password : this.state.password,
          currency : currency
      }
      axios.post(`${APIendpoint}/setting`,body).then(res => {
          if (res.data ){
              console.log(res.data)
          }
      }).catch(err=>{
          console.log(err)
      })
  }
  
  setSetting = (name, value) =>{
    return this.setState({setting:{...this.state.setting, [name]: value}})
  }
  submitSetting = () =>{
    const body = {
        username : this.state.username, 
        password : this.state.password,
        setting: this.state.setting
    }
    axios.post(`${APIendpoint}/setting`,body).then(res => {
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
          <button type="submit" default="true" onClick={()=>this.login()}>Submit</button>
        </div>}
        {this.state.verified &&
        <div className={styles.editor}>
          <div className={styles.navigation}>
            <h5>Choose from below which part you wish to edit.(switching tab will discard all changes)</h5>
            <ul className={styles.navigator}>
              <li className = {classNames({[styles.active]: this.state.tab === "about"})}>
                <a onClick={()=>this.switchTab("about")}>About</a>
              </li>
              <li className = {classNames({[styles.active]: this.state.tab === "faq"})}>
                <a onClick={()=>this.switchTab("faq")}>FAQ</a>
              </li>
              <li className = {classNames({[styles.active]: this.state.tab === "contacts"})}>
                <a onClick={()=>this.switchTab("contacts")}>Contacts</a>
              </li>
              <li className = {classNames({[styles.active]: this.state.tab === "termofuse"})}>
                <a onClick={()=>this.switchTab("termofuse")}>Term of Use</a>
              </li>
              <li className = {classNames({[styles.active]: this.state.tab === "privacypolicy"})}>
                <a onClick={()=>this.switchTab("privacypolicy")}>Privacy Policy</a>
              </li>
              <li className = {classNames({[styles.active]: this.state.tab === "currency"})}>
                <a onClick={()=>this.switchTab("currency")}>Currency</a>
              </li>
              <li className = {classNames({[styles.active]: this.state.tab === "setting"})}>
                <a onClick={()=>this.switchTab("setting")}>Settings</a>
              </li>
            </ul>

          </div>

            {(this.state.tab && this.state.tab !== "currency" && this.state.tab !== "setting") && 
            <div value = {this.state.content}>
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
              <div className={styles.buttons}>
                <button className={styles.discardchange} onClick={()=>this.switchTab(this.state.tab)}>Discard Changes</button>
                <button className={styles.submitchange} onClick={()=>this.submitpost()}>Submit Changes</button>
              </div>
              </div>
            }
            {(this.state.tab === "currency") && 
              <Currencyadmin saveChange={this.submitCurrency}/>
            }
            {(this.state.tab === "setting") && (
            <div className={styles.setting}>
              <div className={styles.settingitem}>
                <label htmlFor="initial">Initial % Default Adjustment</label>
                <input type="number" value={this.state.setting.initial} id="initial" onChange={(e)=>this.setSetting("initial", e.target.value)}/>
              </div>
              <div className={styles.settingitem}>
                <label htmlFor="convey1">Convey Party modifier - 1</label>
                <input type="number" value={this.state.setting.convey1} id="convey1" onChange={(e)=>this.setSetting("convey1", e.target.value)}/>
              </div>
              <div className={styles.settingitem}>
                <label htmlFor="convey2">Convey Party modifier - 2</label>
                <input type="number" value={this.state.setting.convey2} id="convey2" onChange={(e)=>this.setSetting("convey2", e.target.value)}/>
              </div>
              <div className={styles.settingitem}>
                <label htmlFor="convey3">Convey Party modifier - 3</label>
                <input type="number" value={this.state.setting.convey3} id="convey3" onChange={(e)=>this.setSetting("convey3", e.target.value)}/>
              </div>
              <div className={styles.settingitem}>
                <label htmlFor="convey4">Convey Party modifier - 4</label>
                <input type="number" value={this.state.setting.convey4} id="convey4" onChange={(e)=>this.setSetting("convey4", e.target.value)}/>
              </div>
              <div className={styles.settingitem}>
                <label htmlFor="receive1">Receive Party modifier - 1</label>
                <input type="number" value={this.state.setting.receive1} id="receive1" onChange={(e)=>this.setSetting("receive1", e.target.value)}/>
              </div>
              <div className={styles.settingitem}>
                <label htmlFor="receive2">Receive Party modifier - 2</label>
                <input type="number" value={this.state.setting.receive2} id="receive2" onChange={(e)=>this.setSetting("receive2", e.target.value)}/>
              </div>
              <div className={styles.settingitem}>
                <label htmlFor="receive3">Receive Party modifier - 3</label>
                <input type="number" value={this.state.setting.receive3} id="receive3" onChange={(e)=>this.setSetting("receive3", e.target.value)}/>
              </div>
              <div className={styles.settingitem}>
                <label htmlFor="receive4">Receive Party modifier - 4</label>
                <input type="number" value={this.state.setting.receive4} id="receive4" onChange={(e)=>this.setSetting("receive4", e.target.value)}/>
              </div>
              <div className={styles.settingitem}>
                <label htmlFor="democonvey">Demo - Convey Party claim</label>
                <input type="number" value={this.state.setting.democonvey} id="democonvey" onChange={(e)=>this.setSetting("democonvey", e.target.value)}/>
              </div>
              <div className={styles.settingitem}>
                <label htmlFor="demoreceive">Demo - Receive Party claim</label>
                <input type="number" value={this.state.setting.demoreceive} id="demoreceive" onChange={(e)=>this.setSetting("demoreceive", e.target.value)}/>
              </div>
              <div className={styles.settingitem}>
                <label htmlFor="finalmultiplierlower">Final % Multiplier - Lower Limit</label>
                <input type="number" value={this.state.setting.finalmultiplierlower} id="finalmultiplierlower" onChange={(e)=>this.setSetting("finalmultiplierlower", e.target.value)}/>
              </div>
              <div className={styles.settingitem}>
                <label htmlFor="finalmultiplierupper">Final % Multiplier - Upper Limit</label>
                <input type="number" value={this.state.setting.finalmultiplierupper} id="finalmultiplierupper" onChange={(e)=>this.setSetting("finalmultiplierupper", e.target.value)}/>
              </div>
              <div className={styles.buttons}>
                <button className={styles.discardchange} onClick={()=>this.switchTab(this.state.tab)}>Discard Changes</button>
                <button className={styles.submitchange} onClick={()=>this.submitSetting()}>Submit Changes</button>
              </div>
            </div>
            )}
        </div>

        }
  
      </Layout>
    )
  }
  
}