import {useState} from 'react';
import React from "react";

export default function ListItem(props){
    const [step] = useState(props.item.step);

    function checkStep(step){
        let str = '';
        switch (step){
            case '1': 
                str = 'Paided';
                break;
            case '2': 
                str = 'Delivered'
                break;
            default:
                str = 'Create';
                break;
        }
        return str;
    }

    return (
        <tr>
            <td>{props.item.index}</td>
            <td>{props.item.identifier}</td>
            <td>{props.item.price}</td>
            <td>{props.item.addressItem}</td>
            <td>{props.item.ownerAddress}</td>
            <td className='text-primary'>{
                checkStep(step)
            }</td>
            <td>
                {
                    step === '0' ? <button className='btn btn-warning' type='submit' onClick={()=> props.handleClickPaid(props.item)}>Paid</button> 
                    : step === '1' ? <button className='btn btn-danger' type='submit' onClick={()=> props.handleClickDelivered(props.item)} >Deliver</button> : ""
                }
            </td>
        </tr>
    )
}