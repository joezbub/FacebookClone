import React, { createContext } from 'react'
import { useState } from 'react'
import CategorySelection from './CategorySelection';
import PhoneNumberChakra from './PhoneNumberChakra';
import PhoneNumberVerification from './PhoneNumberVerification';
import RegisterFormChakra from './RegisterFormChakra'

export const RegisterContext = createContext();

export default function RegisterPageChakra() {
    const [step, setStep] = useState(1);
    const [data, setData] = useState();
    const [sid, setSid] = useState();
    const [number, setNumber] = useState();

    const incrementStep = () => {
        setStep(prev => prev + 1)
    }

    const jumpToEnd = () => {
      setStep(4)
    }

    const registerVars = {
      step, 
      incrementStep, 
      sid,
      setSid,
      data,
      setData,
      jumpToEnd,
      number,
      setNumber
    }

  return (
    <RegisterContext.Provider value={registerVars}>
        {step === 1 && <RegisterFormChakra/>}
        {step === 2 && <PhoneNumberChakra/>}
        {step === 3 && <PhoneNumberVerification/>}
        {step === 4 && <CategorySelection/>}
    </RegisterContext.Provider>
  )
}
