import Item from './Item';
import React from "react";

export default function ListItem(props){

    return (
        <div id = "list" className='mt-5 list-item'>
          <h1 className='text-center'>Danh sách Item</h1>
          <table id = "table" className='table'>
            <thead>
             <tr className='text-center'>
              <th>#</th>
              <th>Name</th>
              <th>Price</th>
              <th>Address Item</th>
              <th>Owner Address</th>
              <th>State</th>
              <th></th>
             </tr>
            </thead>
            <tbody className='text-center'>
                {props.listItems.map(item =>  (
                  <Item 
                    handleClickPaid = {props.handleClickPaid} 
                    item = {item} key={item.index}
                    handleClickDelivered = {props.handleClickDelivered}
                  />
                ))}
            </tbody>
          </table>
        </div>
    )
}