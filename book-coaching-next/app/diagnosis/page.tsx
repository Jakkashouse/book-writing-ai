'use client'

import { useState, useCallback } from 'react'
import FileUpload from '@/components/diagnosis/FileUpload'
import DiagnosisResult from '@/components/diagnosis/DiagnosisResult'
import QuestionnaireForm, {
  getEmptyQuestionnaire,
  questionnaireToText,
  type QuestionnaireData,
} from '@/components/diagnosis/QuestionnaireForm'
import Button from '@/components/ui/Button'

type Step = 'form' | 'result'

export default function DiagnosisPage() {
  const [step, setStep] = useState<Step>('form')
  const [authorName, setAuthorName] = useState('')
  const [email, setEmail] = useState('')
  const [manuscriptFile, setManuscriptFile] = useState<File | null>(null)
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>(getEmptyQuestionnaire)
  const [submissionId, setSubmissionId] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleSubmit = useCallback(async () => {
    if (!authorName.trim() || !email.trim() || !manuscriptFile) {
      setUploadError('작가 이름, 이메일, 원고 파일을 모두 입력해주세요.')
      return
    }
    setUploadError('')
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('authorName', authorName)
      formData.append('email', email)
      formData.append('manuscript', manuscriptFile)
      formData.append('questionnaireText', questionnaireToText(questionnaire))

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setUploadError(data.error || '업로드에 실패했습니다.')
        return
      }

      setSubmissionId(data.id)
      setStep('result')
    } catch {
      setUploadError('업로드 중 오류가 발생했습니다.')
    } finally {
      setIsUploading(false)
    }
  }, [authorName, email, manuscriptFile, questionnaire])

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white border-b border-surface-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="font-bold text-primary text-lg">작가의 집</span>
          </a>
          <span className="text-sm text-text-muted">무료 원고 진단</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { key: 'form', label: '1. 질문지 + 원고 업로드', icon: '📋' },
            { key: 'result', label: '2. AI 진단 결과', icon: '📊' },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center">
              {i > 0 && <div className="w-8 h-px bg-surface-border mx-2" />}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
                  step === s.key
                    ? 'bg-primary text-white font-semibold'
                    : 'bg-gray-100 text-text-muted'
                }`}
              >
                <span>{s.icon}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Form + Upload */}
        {step === 'form' && (
          <div className="space-y-6">
            {/* Intro */}
            <div className="bg-white rounded-2xl border border-surface-border p-6 md:p-8 text-center space-y-3">
              <h1 className="text-2xl font-bold text-text">무료 원고 진단 서비스</h1>
              <p className="text-text-secondary max-w-lg mx-auto">
                AI가 원고를 분석하여 구조, 문장, 메시지, 몰입도를 100점 만점으로 평가합니다.
                아래 질문지를 작성하고 원고를 업로드해주세요.
              </p>
            </div>

            {/* Author Info + Manuscript */}
            <div className="bg-white rounded-2xl border border-surface-border p-6 md:p-8 space-y-4">
              <h2 className="font-semibold text-text text-lg">기본 정보</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    작가 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="author@email.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <FileUpload
                label="원고 파일"
                accept=".docx,.pdf,.txt,.md"
                maxSizeMB={10}
                onFileSelect={setManuscriptFile}
                required
              />
            </div>

            {/* Questionnaire */}
            <div className="bg-white rounded-2xl border border-surface-border p-6 md:p-8 space-y-4">
              <div>
                <h2 className="font-semibold text-text text-lg">작가 질문지</h2>
                <p className="text-sm text-text-muted mt-1">
                  해당하는 항목만 클릭해서 작성하세요. 솔직할수록 정확한 판매량 예측이 가능합니다.
                </p>
                <p className="text-xs text-text-muted mt-1">
                  * 질문지가 없어도 원고 진단은 가능하지만, 판매량 예측의 정확도가 떨어질 수 있습니다.
                </p>
              </div>
              <QuestionnaireForm data={questionnaire} onChange={setQuestionnaire} />
            </div>

            {/* Submit */}
            {uploadError && (
              <p className="text-sm text-red-500 text-center">{uploadError}</p>
            )}
            <div className="text-center pb-8">
              <Button
                onClick={handleSubmit}
                disabled={isUploading || !manuscriptFile}
                size="lg"
              >
                {isUploading ? '업로드 중...' : 'AI 진단 시작하기'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Result */}
        {step === 'result' && submissionId && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-text">AI 원고 진단 결과</h1>
              <p className="text-text-secondary">
                <strong>{authorName}</strong> 작가님의 원고를 분석하고 있습니다.
              </p>
            </div>
            <DiagnosisResult submissionId={submissionId} />
          </div>
        )}
      </main>
    </div>
  )
}
