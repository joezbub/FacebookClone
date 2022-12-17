import React from 'react'
import '../css/main.css'

export default function FormComponent(props) {
    const {name, placeholder="", type=null} = props;
  return (
    <div className='form-input-component'>
        <p className='form-field-header'>{name}</p>
        <input className="form-field-text-input" id="form-field-text-input" type={type ? type : 'text'} placeholder={placeholder} />
    </div>
  )
}
