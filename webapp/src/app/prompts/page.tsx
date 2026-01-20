'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Prompt {
  id: string;
  name: string;
  description: string;
  category: string;
  variables: string[];
  tags: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
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

export default function PromptsPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPrompts();
  }, [selectedCategory, searchQuery]);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/prompts?${params.toString()}`);
      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (promptId: string) => {
    router.push(`/prompts/${promptId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            프롬프트 템플릿
          </h1>
          <p className="text-gray-600">
            책 쓰기를 위한 전문 AI 프롬프트 템플릿 모음
          </p>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="프롬프트 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">모든 카테고리</option>
                {Object.entries(categoryNames).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 프롬프트 목록 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                onClick={() => handlePromptClick(prompt.id)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      categoryColors[prompt.category]
                    }`}
                  >
                    {categoryNames[prompt.category]}
                  </span>
                  <span className="text-xs text-gray-500">
                    사용 {prompt.usageCount}회
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {prompt.name}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {prompt.description}
                </p>

                {prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {prompt.tags.length > 3 && (
                      <span className="px-2 py-1 text-gray-400 text-xs">
                        +{prompt.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && prompts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">프롬프트가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
