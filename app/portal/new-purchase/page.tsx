'use client'

import { useState } from 'react'
import CategorySelect  from './steps/CategorySelect'
import BundleSelect    from './steps/BundleSelect'
import TierSelect      from './steps/TierSelect'
import KycForm         from './steps/KycForm'
import PaymentSummary  from './steps/PaymentSummary'
import Confirmation    from './steps/Confirmation'

export type PurchaseState = {
  category:   'affinity' | 'standard' | null
  bundleId:   string | null
  bundleName: string | null
  tierId:     string | null
  tierName:   'CORE' | 'PULSE' | 'ZENITH' | null
  totalAmount: number | null
  rahaSplit:   number | null
  abnicSplit:  number | null
  planCode:    string | null
  kyc: {
    fullName:    string
    whatsapp:    string
    email:       string
    dateOfBirth: string
    sponsorId:   string
    emiratesId:  string
    doc1:        File | null
    doc2:        File | null
    doc3:        File | null
    doc4:        File | null
  }
  transactionId:  string | null
  transactionRef: string | null
  rahaCardUrl:    string | null
  abnicCardUrl:   string | null
}

const EMPTY_STATE: PurchaseState = {
  category: null, bundleId: null, bundleName: null,
  tierId: null, tierName: null,
  totalAmount: null, rahaSplit: null, abnicSplit: null, planCode: null,
  kyc: {
    fullName: '', whatsapp: '', email: '', dateOfBirth: '',
    sponsorId: '', emiratesId: '',
    doc1: null, doc2: null, doc3: null, doc4: null,
  },
  transactionId: null, transactionRef: null,
  rahaCardUrl: null, abnicCardUrl: null,
}

const STEP_LABELS = [
  'Category', 'Programme', 'Plan', 'Member Details', 'Payment', 'Confirmation'
]

export default function NewPurchasePage() {
  const [step,  setStep]  = useState(0)
  const [state, setState] = useState<PurchaseState>(EMPTY_STATE)

  const next = () => setStep(s => Math.min(s + 1, 5))
  const back = () => setStep(s => Math.max(s - 1, 0))
  const reset = () => { setStep(0); setState(EMPTY_STATE) }

  const update = (patch: Partial<PurchaseState>) =>
    setState(prev => ({ ...prev, ...patch }))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Purchase</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Raha Affinity Programme · ABNIC Insurance
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-8 overflow-x-auto">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i < step  ? 'bg-teal-500 text-white' :
                i === step ? 'bg-blue-600 text-white' :
                             'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-1 whitespace-nowrap ${
                i === step ? 'text-blue-600 font-semibold' : 'text-slate-400'
              }`}>{label}</span>
            </div>
            {i < 5 && (
              <div className={`h-0.5 w-8 sm:w-12 mx-1 mb-4 transition-colors ${
                i < step ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        {step === 0 && <CategorySelect  state={state} update={update} onNext={next} />}
        {step === 1 && <BundleSelect    state={state} update={update} onNext={next} onBack={back} />}
        {step === 2 && <TierSelect      state={state} update={update} onNext={next} onBack={back} />}
        {step === 3 && <KycForm         state={state} update={update} onNext={next} onBack={back} />}
        {step === 4 && <PaymentSummary  state={state} update={update} onNext={next} onBack={back} />}
        {step === 5 && <Confirmation    state={state} onReset={reset} />}
      </div>
    </div>
  )
}
