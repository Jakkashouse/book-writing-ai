'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, Copy, ArrowLeft, Play } from 'lucide-react';

interface Prompt {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  variables: string[];
  tags: string[];
  usageCount: number;
  _count: {
    usageLogs: number;
    favorites: number;
  };
}

const categoryNames: Record<string, string> = {
  TITLE_TOC: '제목/목차 기획',
  DRAFT: '초안 작성',
  EDITING: '원고 교정/진단',
  PROPOSAL: '출판 제안서',
  MARKETING: '마케팅/홍보',
  COACHING: '코칭/피드백',
  WORKFLOW: '워크플로우/템플릿',
  BUSINESS: '비즈니스/계약',
};

const categoryColors: Record<string, string> = {
  TITLE_TOC: 'bg-blue-100 text-blue-800',
  DRAFT: 'bg-green-100 text-green-800',
  EDITING: 'bg-yellow-100 text-yellow-800',
  PROPOSAL: 'bg-purple-100 text-purple-800',
  MARKETING: 'bg-pink-100 text-pink-800',
  COACHING: 'bg-indigo-100 text-indigo-800',
  WORKFLOW: 'bg-gray-100 text-gray-800',
  BUSINESS: 'bg-red-100 text-red-800',
};

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPrompt(params.id as string);
    }
  }, [params.id]);

  const fetchPrompt = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/prompts/${id}`);
      const data = await response.json();
      setPrompt(data.prompt);

      // 변수 초기화
      const initialVariables: Record<string, string> = {};
      data.prompt.variables.forEach((variable: string) => {
        initialVariables[variable] = '';
      });
      setVariables(initialVariables);
    } catch (error) {
      console.error('Error fetching prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = async () => {
    if (prompt) {
      try {
        await navigator.clipboard.writeText(generatedPrompt || prompt.template);
        alert('프롬프트가 클립보드에 복사되었습니다.');
      } catch (error) {
        console.error('Error copying prompt:', error);
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (!prompt) return;

    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch(`/api/prompts/${prompt.id}/favorite`, {
        method,
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleGeneratePrompt = () => {
    if (!prompt) return;

    let generated = prompt.template;
    Object.entries(variables).forEach(([key, value]) => {
      // 변수 형식: {{변수명}} 또는 [변수명]
      generated = generated.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      generated = generated.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
    });

    setGeneratedPrompt(generated);
    setShowPreview(true);

    // 사용 기록 저장
    saveUsageLog();
  };

  const saveUsageLog = async () => {
    if (!prompt) return;

    try {
      await fetch('/api/prompts/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId: prompt.id,
          variables,
        }),
      });
    } catch (error) {
      console.error('Error saving usage log:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-500">프롬프트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </button>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    categoryColors[prompt.category]
                  }`}
                >
                  {categoryNames[prompt.category]}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-2">
                  {prompt.name}
                </h1>
                <p className="text-gray-600">{prompt.description}</p>
              </div>
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite
                    ? 'text-yellow-500 bg-yellow-50'
                    : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                }`}
              >
                <Star className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* 통계 */}
            <div className="flex gap-6 text-sm text-gray-500">
              <div>
                사용 횟수: <span className="font-medium">{prompt._count.usageLogs}</span>
              </div>
              <div>
                즐겨찾기: <span className="font-medium">{prompt._count.favorites}</span>
              </div>
            </div>

            {/* 태그 */}
            {prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {prompt.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 변수 입력 폼 */}
        {prompt.variables.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">변수 입력</h2>
            <div className="grid grid-cols-1 gap-4">
              {prompt.variables.map((variable) => (
                <div key={variable}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {variable}
                  </label>
                  <textarea
                    value={variables[variable] || ''}
                    onChange={(e) =>
                      setVariables({ ...variables, [variable]: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`${variable}을(를) 입력하세요...`}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleGeneratePrompt}
              className="mt-4 w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Play className="w-5 h-5 mr-2" />
              프롬프트 생성
            </button>
          </div>
        )}

        {/* 프롬프트 템플릿 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {showPreview ? '생성된 프롬프트' : '프롬프트 템플릿'}
            </h2>
            <button
              onClick={handleCopyPrompt}
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              복사
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">
              {showPreview ? generatedPrompt : prompt.template}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
