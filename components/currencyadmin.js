import React from 'react';
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import styles from "./currencyadmin.module.scss"
import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes, faEdit, faCheck } from '@fortawesome/free-solid-svg-icons'
const APIendpoint = process.env.APIendpoint
const DragHandle = sortableHandle(() => <div className="dragsorticon"><FontAwesomeIcon icon={faBars} /></div>);
const SortableItem = sortableElement(({children}) => {
    return <div className="dragsortitem">{children}</div>;
  });
const SortableContainer = sortableContainer(({children}) => {
  return <div  className="dragsortcontainer">{children}</div>;
});

class Currencyadmin extends React.Component {
  state = {
    currency: [],
    editing: -1
  };
  componentDidMount(){
    axios.get(`${APIendpoint}/setting`).then(res => {
        if (res.data ){
            console.log(res.data)
            this.setState({currency:res.data.setting.currency},()=>{
            })
        }
    }).catch(err=>{
        console.log(err)
    })
  }
  onSortEnd = ({oldIndex, newIndex}) => {
    this.setState(({currency}) => ({
      currency: arrayMove(currency, oldIndex, newIndex),
    }));
  };

  addNew = () => {
    if (this.state.editing === -1){
      this.setState(({currency}) => ({
        currency: [...currency, {name:"", symbol:""}],
        editing: currency.length
      }));
    }
  };
  handleKeyDown(event){
    if (event.charCode == 13) {
      this.setState({editing:-1});
    }
  }
  render() {
    const {currency, editing} = this.state;

    return (
      <div  className={styles.currencyadmin}>
        <div className={styles.buttons}>
          <button className={styles.add} onClick={()=>this.addNew()}>Add Currency</button>
          <button className={styles.save} onClick={()=>this.props.saveChange(this.state.currency)}>Save Change</button>
        </div>
        <SortableContainer onSortEnd={this.onSortEnd} useDragHandle lockAxis={"y"}>
          {currency.map((cur, index) => (
            <SortableItem key={`item-${index}`} index={index}>
                  <div  className="dragsortcontent">
                      <DragHandle />
                      {editing===index ? 
                      <div className="dragsortsymbol"><input value={cur.symbol} type="text" autoFocus 
                      onKeyPress = {(e)=>this.handleKeyDown(e)} 
                      onChange={(e)=>{
                        const value = e.target.value
                        this.setState(({currency})=>({currency: currency.map((curr,idx)=>{
                            if(idx===index){
                              return {...curr, symbol:value}
                            }
                            return curr
                        })}))
                      }}/></div> : 
                      <div className="dragsortsymbol"><div>{cur.symbol}</div></div> }
                      {editing===index ? 
                      <div className="dragsortname"><input value={cur.name} type="text" 
                      onKeyPress = {(e)=>this.handleKeyDown(e)} 
                      onChange={(e)=>{
                        const value = e.target.value
                          this.setState(({currency})=>({currency: currency.map((curr,idx)=>{
                              if(idx===index){
                                  return {...curr, name:value}
                              }
                              return curr
                          })}))
                      }}/></div> : 
                      <div className="dragsortname"><div>{cur.name}</div> </div> }
                  </div>
                  
                  <div  className="dragsortaction">
                      {editing!==index ?
                      <div className="dragsorticon edit" onClick={()=>{this.setState({editing: index})}}><FontAwesomeIcon icon={faEdit} /></div>:
                      <div className="dragsorticon check" onClick={()=>{this.setState({editing: -1})}} ><FontAwesomeIcon icon={faCheck} /></div>}
                      <div className="dragsorticon remove" onClick={()=>{
                          this.setState(({currency})=>({
                              currency: currency.filter((curr,idx)=>idx!==index)
                          })
                        )}}><FontAwesomeIcon icon={faTimes} /></div>
                  </div>
            </SortableItem>
          ))}
        </SortableContainer>
      </div>
    );
  }
}

export default Currencyadmin;