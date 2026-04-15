'use client'
import { useState, useRef } from 'react'
import type { PurchaseState } from '../page'

interface Props {
  state:  PurchaseState
  update: (p: Partial<PurchaseState>) => void
  onNext: () => void
  onBack: () => void
}

type KycErrors = Partial<Record<keyof PurchaseState['kyc'], string>>

function normaliseEid(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 15) {
    return `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7,14)}-${digits.slice(14)}`
  }
  return raw
}

function validateKyc(kyc: PurchaseState['kyc']): KycErrors {
  const errors: KycErrors = {}
  if (!kyc.fullName.trim())                          errors.fullName    = 'Full name is required.'
  if (kyc.fullName.length > 100)                     errors.fullName    = 'Max 100 characters.'
  if (!kyc.whatsapp.match(/^\+\d{7,15}$/))           errors.whatsapp    = 'Enter a valid number with country code e.g. +971501234567'
  if (!kyc.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))errors.email       = 'Enter a valid email address.'
  if (!kyc.dateOfBirth)                              errors.dateOfBirth = 'Date of birth is required.'
  else {
    const age = Math.floor((Date.now() - new Date(kyc.dateOfBirth).getTime()) / 31557600000)
    if (age < 18 || age > 65)                        errors.dateOfBirth = 'Member must be aged 18–65.'
  }
  if (!kyc.sponsorId.trim())                         errors.sponsorId   = 'Sponsor ID is required.'
  if (kyc.sponsorId.length > 20)                     errors.sponsorId   = 'Max 20 characters.'
  if (!kyc.emiratesId.trim())                        errors.emiratesId  = 'Emirates ID is required.'
  if (!kyc.doc1)                                     errors.doc1        = 'Document 1 is required.'
  if (!kyc.doc2)                                     errors.doc2        = 'Document 2 is required.'
  return errors
}

function FileField({ label, required, value, onChange, error }: {
  label: string; required: boolean
  value: File | null; onChange: (f: File | null) => void; error?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        onClick={() => ref.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-lg px-4 py-3 text-sm transition-colors ${
          error
            ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
            : value
            ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/10'
            : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
        }`}
      >
        {value ? (
          <div className="flex items-center justify-between">
            <span className="text-teal-700 dark:text-teal-300 truncate">✓ {value.name}</span>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(null); if (ref.current) ref.current.value = '' }}
              className="text-slate-400 hover:text-red-500 ml-2 flex-shrink-0"
            >✕</button>
          </div>
        ) : (
          <span className="text-slate-400">Click to upload · PDF or JPG · max 5 MB</span>
        )}
      </div>
      <input
        ref={ref} type="file" accept=".pdf,.jpg,.jpeg" className="hidden"
        onChange={e => {
          const f = e.target.files?.[0] ?? null
          if (f && f.size > 5 * 1024 * 1024) { alert('File exceeds 5 MB limit.'); return }
          onChange(f)
        }}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function Field({ label, required, type = 'text', value, onChange, error, placeholder, max }: {
  label: string; required: boolean; type?: string
  value: string; onChange: (v: string) => void
  error?: string; placeholder?: string; max?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type} value={value} placeholder={placeholder} max={max}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-3 py-2 rounded-lg border text-sm dark:bg-slate-800 dark:text-white transition-colors ${
          error
            ? 'border-red-400 bg-red-50 dark:bg-red-900/10 focus:ring-red-300'
            : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-200'
        } focus:outline-none focus:ring-2`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default function KycForm({ state, update, onNext, onBack }: Props) {
  const [errors,   setErrors]   = useState<KycErrors>({})
  const [submitted,setSubmitted] = useState(false)

  const kyc = state.kyc
  const set = (key: keyof PurchaseState['kyc'], val: any) => {
    const next = { ...kyc, [key]: val }
    update({ kyc: next })
    if (submitted) setErrors(validateKyc(next))
  }

  const handleSubmit = () => {
    setSubmitted(true)
    const errs = validateKyc(kyc)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onNext()
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Member Details</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Enter the member&apos;s information. Fields marked <span className="text-red-500">*</span> are required.
      </p>

      {/* Shared fields — routed to Raha + ABNIC */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Personal Information</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" required value={kyc.fullName}
            onChange={v => set('fullName', v)} error={errors.fullName}
            placeholder="As on Emirates ID" />
          <Field label="WhatsApp Number" required value={kyc.whatsapp}
            onChange={v => set('whatsapp', v)} error={errors.whatsapp}
            placeholder="+971501234567" />
          <Field label="Email Address" required type="email" value={kyc.email}
            onChange={v => set('email', v)} error={errors.email}
            placeholder="member@email.com" />
          <Field label="Date of Birth" required type="date" value={kyc.dateOfBirth}
            onChange={v => set('dateOfBirth', v)} error={errors.dateOfBirth} max={today} />
          <Field label="Sponsor / Employer ID" required value={kyc.sponsorId}
            onChange={v => set('sponsorId', v)} error={errors.sponsorId}
            placeholder="Alphanumeric, max 20 chars" />
        </div>
      </div>

      {/* ABNIC-only fields */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Insurance Verification (ABNIC only)</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Emirates ID / E-Visa Number" required value={kyc.emiratesId}
              onChange={v => set('emiratesId', normaliseEid(v))} error={errors.emiratesId}
              placeholder="784-XXXX-XXXXXXX-X" />
          </div>
          <FileField label="KYC Document 1 (Passport / EID)" required
            value={kyc.doc1} onChange={f => set('doc1', f)} error={errors.doc1} />
          <FileField label="KYC Document 2 (Visa / Residence)" required
            value={kyc.doc2} onChange={f => set('doc2', f)} error={errors.doc2} />
          <FileField label="KYC Document 3 (Optional)"
            required={false} value={kyc.doc3} onChange={f => set('doc3', f)} />
          <FileField label="KYC Document 4 (Optional)"
            required={false} value={kyc.doc4} onChange={f => set('doc4', f)} />
        </div>
      </div>

      {submitted && Object.keys(errors).length > 0 && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          Please fix the errors above before continuing.
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button onClick={onBack}
          className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
          Back
        </button>
        <button onClick={handleSubmit}
          className="px-6 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Proceed to Payment
        </button>
      </div>
    </div>
  )
}
