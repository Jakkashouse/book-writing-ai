import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { extractText } from '@/lib/file-parser'
import { saveUploadedFile, addSubmission } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const authorName = formData.get('authorName') as string
    const email = formData.get('email') as string
    const manuscriptFile = formData.get('manuscript') as File | null
    const questionnaireFile = formData.get('questionnaire') as File | null
    const questionnaireTextDirect = formData.get('questionnaireText') as string | null

    if (!authorName || !email || !manuscriptFile) {
      return NextResponse.json(
        { error: '작가 이름, 이메일, 원고 파일은 필수입니다.' },
        { status: 400 }
      )
    }

    const id = uuidv4()

    // Process manuscript
    const manuscriptBuffer = Buffer.from(await manuscriptFile.arrayBuffer())
    const manuscriptPath = await saveUploadedFile(id, 'manuscript', manuscriptBuffer, manuscriptFile.name)
    const manuscriptText = await extractText(manuscriptBuffer, manuscriptFile.name)

    // Process questionnaire (optional) — accept either web form text or uploaded file
    let questionnairePath = ''
    let questionnaireText = ''
    if (questionnaireTextDirect && questionnaireTextDirect.trim()) {
      questionnaireText = questionnaireTextDirect
    } else if (questionnaireFile && questionnaireFile.size > 0) {
      const questionnaireBuffer = Buffer.from(await questionnaireFile.arrayBuffer())
      questionnairePath = await saveUploadedFile(id, 'questionnaire', questionnaireBuffer, questionnaireFile.name)
      questionnaireText = await extractText(questionnaireBuffer, questionnaireFile.name)
    }

    await addSubmission({
      id,
      authorName,
      email,
      manuscriptFile: manuscriptPath,
      questionnaireFile: questionnairePath,
      manuscriptText,
      questionnaireText,
      diagnosis: '',
      adminComment: '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      id,
      manuscriptLength: manuscriptText.length,
      questionnaireLength: questionnaireText.length,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
