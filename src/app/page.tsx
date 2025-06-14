"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Video, Zap, Target, Briefcase } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/studio");
  };

  const handleCustomModelInquiry = () => {
    router.push("/contact");
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-pink-500/10 opacity-50" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />

        <div className="relative px-4 py-20 md:py-32">
          <div className="max-w-6xl mx-auto text-center">
            {/* Logo/Brand */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Trynic
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 font-light">
                브랜드 맞춤형 AI 영상 생성 플랫폼
              </p>
            </div>

            {/* Main description */}
            <div className="mb-12 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                기업의 브랜드 아이덴티티를 담은
                <span className="text-sky-400"> 맞춤형 AI 모델</span>로
                <br />
                <span className="text-purple-400">전문적인 영상</span>을 제작하세요
              </h2>
            </div>

            {/* CTA Buttons */}
            <div className="mb-16">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleGetStarted}
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-sky-500 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-sky-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-[0_8px_30px_rgb(14,165,233,0.3)]"
                >
                  영상 생성하기
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleCustomModelInquiry}
                  className="group inline-flex items-center px-8 py-4 bg-black/40 backdrop-blur-xl border-2 border-white/20 text-white text-lg font-semibold rounded-full hover:bg-white/10 hover:border-sky-400/50 transition-all duration-300 transform hover:scale-105 shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
                >
                  맞춤형 모델 문의
                  <Briefcase className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              왜 <span className="text-sky-400">Trynic</span>인가?
            </h3>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              기업의 브랜드를 이해하는 AI로 일관성 있고 전문적인 영상을 제작합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-sky-500/30 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-sky-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="w-8 h-8 text-sky-400" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-4">브랜드 맞춤형 모델</h4>
              <p className="text-gray-400 leading-relaxed">
                기업의 로고, 컬러, 디자인 요소를 학습하여 브랜드 아이덴티티가 일관되게 반영된 AI 모델을 생성합니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-purple-500/30 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Video className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-4">전문적인 영상 제작</h4>
              <p className="text-gray-400 leading-relaxed">
                마케팅, 교육, 프레젠테이션 등 다양한 목적에 맞는 고품질 영상을 AI가 자동으로 제작합니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-pink-500/30 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500/20 to-sky-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-pink-400" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-4">빠른 제작 속도</h4>
              <p className="text-gray-400 leading-relaxed">
                기존 영상 제작 시간을 90% 단축하여 빠르게 브랜드 콘텐츠를 생산할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works Section */}
      <div className="py-20 px-4 bg-gradient-to-b from-transparent to-black/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              간단한 3단계로 <span className="text-sky-400">시작하세요</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-sky-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                1
              </div>
              <h4 className="text-xl font-bold text-white mb-4">브랜드 자료 업로드</h4>
              <p className="text-gray-400">
                로고, 브랜드 가이드라인, 기존 마케팅 자료를 업로드하세요
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                2
              </div>
              <h4 className="text-xl font-bold text-white mb-4">AI 모델 학습</h4>
              <p className="text-gray-400">
                AI가 브랜드의 특성을 분석하고 맞춤형 모델을 생성합니다
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                3
              </div>
              <h4 className="text-xl font-bold text-white mb-4">영상 생성</h4>
              <p className="text-gray-400">
                원하는 콘텐츠 주제를 입력하면 브랜드에 맞는 영상을 제작합니다
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            지금 바로 <span className="text-sky-400">Trynic</span>으로
            <br />
            브랜드 영상을 제작해보세요
          </h3>
          <p className="text-xl text-gray-400 mb-8">
            무료 체험으로 AI 영상 제작의 놀라운 경험을 시작하세요
          </p>
          <button
            onClick={handleGetStarted}
            className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-sky-500 to-purple-600 text-white text-xl font-semibold rounded-full hover:from-sky-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-[0_8px_30px_rgb(14,165,233,0.3)]"
          >
            무료로 시작하기
            <Sparkles className="ml-3 w-6 h-6 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
