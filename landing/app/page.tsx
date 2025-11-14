"use client";

import {
  Store,
  Sparkles,
  ArrowRight,
  PlayCircle,
  CheckCircle,
  Zap,
  Rocket,
  UserPlus,
  PackagePlus,
  Palette,
  Share2,
  MessageCircle,
  Image,
  Link,
  Link2,
  Globe,
  Copy,
  Clock,
  BarChart3,
  Gift,
  Smartphone,
  Star,
  Crown,
  Bot,
  TrendingUp,
} from "lucide-react";
import LightRays from "@/components/LightRays";

export default function Home() {
  return (
    <div className="font-manrope antialiased text-gray-900 relative min-h-screen">
      {/* Light Rays Background */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">

      </div>
      {/* Hero Section */}
      <div className="relative z-10 min-h-screen w-full flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <span className="font-plex text-xl font-semibold text-gray-900">
                SuaVitrine
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition"
              >
                Funcionalidades
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition"
              >
                Preços
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition"
              >
                Exemplos
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <a
                href="https://app.suavitrine.tech"
                className="text-sm text-gray-600 hover:text-gray-900 transition px-4 py-2"
              >
                Entrar
              </a>
              <a
                href="https://app.suavitrine.tech"
                className="text-sm bg-violet-500 text-white px-4 py-2 rounded-lg hover:bg-violet-600 transition shadow-md"
              >
                Começar grátis
              </a>
            </div>
          </div>
        </header>

        {/* Main Hero Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 border border-violet-200 rounded-full mb-6 shadow-md">
                <Sparkles className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
                <span className="text-sm text-violet-700 font-medium">
                  Grátis para sempre
                </span>
              </div>

              {/* Heading */}
              <h1 className="font-plex text-4xl tracking-tight font-semibold text-gray-900 mb-6 leading-tight">
                Crie sua vitrine digital em minutos
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Com a SuaVitrine, qualquer pessoa pode montar uma loja online
                personalizada — sem precisar saber design ou programação.
                Cadastre-se, adicione seus produtos e receba um link único para
                compartilhar sua vitrine.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start">
                <a
                  href="https://app.suavitrine.tech"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-500 text-white font-medium rounded-lg hover:bg-violet-600 transition shadow-md"
                >
                  Comece agora gratuitamente
                  <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                </a>
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:border-gray-400 transition shadow-md">
                  <PlayCircle className="w-5 h-5" strokeWidth={1.5} />
                  Ver demonstração
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-gray-600 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className="w-4 h-4 text-violet-500"
                    strokeWidth={1.5}
                  />
                  <span>Sem cartão necessário</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
                  <span>Configuração em 5 minutos</span>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-8 shadow-md border border-violet-100">
                {/* Mock Browser Window */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                  {/* Browser Header */}
                  <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 bg-white border border-gray-200 rounded px-3 py-1 text-xs text-gray-500 ml-2">
                      suavitrine.com/minhaloja
                    </div>
                  </div>

                  {/* Browser Content */}
                  <div className="p-6 bg-white">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                      <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                        <Store
                          className="w-6 h-6 text-violet-500"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div>
                        <h3 className="font-plex font-semibold text-gray-900">
                          Minha Loja
                        </h3>
                        <p className="text-xs text-gray-500">
                          Produtos artesanais
                        </p>
                      </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                        >
                          <div className="bg-gray-200 rounded h-24 mb-2 flex items-center justify-center">
                            <Image
                              className="w-8 h-8 text-gray-400"
                              strokeWidth={1.5}
                            />
                          </div>
                          <div className="h-2 bg-gray-300 rounded w-3/4 mb-1"></div>
                          <div className="h-2 bg-violet-300 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -right-4 -top-4 bg-white rounded-lg shadow-md p-3 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Palette
                      className="w-4 h-4 text-violet-500"
                      strokeWidth={1.5}
                    />
                    <span className="text-xs font-medium text-gray-700">
                      Temas personalizados
                    </span>
                  </div>
                </div>
                <div className="absolute -left-4 bottom-12 bg-white rounded-lg shadow-md p-3 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
                    <span className="text-xs font-medium text-gray-700">
                      Link único
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer Stats */}
        <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm py-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="font-plex text-3xl font-semibold text-violet-500 mb-1">
                  +500
                </div>
                <div className="text-sm text-gray-600">Lojistas ativos</div>
              </div>
              <div>
                <div className="font-plex text-3xl font-semibold text-violet-500 mb-1">
                  +2k
                </div>
                <div className="text-sm text-gray-600">Produtos cadastrados</div>
              </div>
              <div>
                <div className="font-plex text-3xl font-semibold text-violet-500 mb-1">
                  5min
                </div>
                <div className="text-sm text-gray-600">Tempo médio de setup</div>
              </div>
              <div>
                <div className="font-plex text-3xl font-semibold text-violet-500 mb-1">
                  100%
                </div>
                <div className="text-sm text-gray-600">Gratuito</div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Onboarding Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white via-violet-50/30 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 border border-violet-200 rounded-full mb-4">
              <Rocket className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
              <span className="text-sm text-violet-700 font-medium">
                Como funciona
              </span>
            </div>
            <h2 className="font-plex text-4xl tracking-tight font-semibold text-gray-900 mb-4">
              Sua vitrine pronta em 4 passos simples
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Criamos uma experiência intuitiva para que você possa focar no que
              importa: seus produtos e seus clientes.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Step 1 */}
            <div className="step-card relative">
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg hover:border-violet-200 transition-all duration-300 h-full">
                {/* Step Number */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                    <span className="font-plex text-xl font-semibold text-white">
                      1
                    </span>
                  </div>
                  <div className="hidden lg:block text-violet-200">
                    <ArrowRight className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Icon Container */}
                <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-6 animate-float">
                  <UserPlus
                    className="w-8 h-8 text-violet-500"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Content */}
                <h3 className="font-plex text-xl font-semibold text-gray-900 mb-3">
                  Cadastre-se
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Crie sua conta gratuitamente em segundos. Sem burocracia, sem
                  cartão de crédito.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="step-card relative">
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg hover:border-violet-200 transition-all duration-300 h-full">
                {/* Step Number */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                    <span className="font-plex text-xl font-semibold text-white">
                      2
                    </span>
                  </div>
                  <div className="hidden lg:block text-violet-200">
                    <ArrowRight className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Icon Container */}
                <div
                  className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-6 animate-float"
                  style={{ animationDelay: "0.2s" }}
                >
                  <PackagePlus
                    className="w-8 h-8 text-violet-500"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Content */}
                <h3 className="font-plex text-xl font-semibold text-gray-900 mb-3">
                  Monte sua loja
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Adicione produtos com fotos, descrições e preços. Organize por
                  categorias do seu jeito.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="step-card relative">
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg hover:border-violet-200 transition-all duration-300 h-full">
                {/* Step Number */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                    <span className="font-plex text-xl font-semibold text-white">
                      3
                    </span>
                  </div>
                  <div className="hidden lg:block text-violet-200">
                    <ArrowRight className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Icon Container */}
                <div
                  className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-6 animate-float"
                  style={{ animationDelay: "0.4s" }}
                >
                  <Palette className="w-8 h-8 text-violet-500" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <h3 className="font-plex text-xl font-semibold text-gray-900 mb-3">
                  Personalize o tema
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Escolha cores, layout e estilo da vitrine. Deixe com a sua cara
                  em poucos cliques.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="step-card relative">
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg hover:border-violet-200 transition-all duration-300 h-full">
                {/* Step Number */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                    <span className="font-plex text-xl font-semibold text-white">
                      4
                    </span>
                  </div>
                </div>

                {/* Icon Container */}
                <div
                  className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-6 animate-float"
                  style={{ animationDelay: "0.6s" }}
                >
                  <Share2 className="w-8 h-8 text-violet-500" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <h3 className="font-plex text-xl font-semibold text-gray-900 mb-3">
                  Compartilhe o link
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Receba seu link único e compartilhe nas redes sociais. Sua
                  vitrine está pronta!
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div
            className="text-center animate-fadeInUp"
            style={{ animationDelay: "0.9s" }}
          >
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-10 shadow-xl border border-violet-300">
              <div className="max-w-2xl mx-auto">
                <h3 className="font-plex text-3xl tracking-tight font-semibold text-white mb-4">
                  Pronto para começar?
                </h3>
                <p className="text-violet-100 text-lg mb-8">
                  Junte-se a centenas de empreendedores que já estão vendendo
                  online com a SuaVitrine.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://app.suavitrine.tech"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-violet-600 font-medium rounded-lg hover:bg-gray-50 transition shadow-lg"
                  >
                    <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                    Crie sua vitrine grátis
                  </a>
                  <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 text-white font-medium rounded-lg border-2 border-white/20 hover:bg-violet-700 transition">
                    <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                    Falar com suporte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 border border-violet-200 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
              <span className="text-sm text-violet-700 font-medium">
                Benefícios
              </span>
            </div>
            <h2 className="font-plex text-4xl tracking-tight font-semibold text-gray-900 mb-4">
              Tudo que você precisa para vender online
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Uma plataforma completa, intuitiva e gratuita para transformar sua
              ideia em realidade.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
            <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                  <Zap className="w-4 h-4 text-white" strokeWidth={1.5} />
                  <span className="text-xs text-white font-medium">
                    Rápido e fácil
                  </span>
                </div>
                <h3 className="font-plex text-3xl tracking-tight font-semibold text-white mb-4">
                  Configure sua loja em minutos
                </h3>
                <p className="text-violet-50 text-lg mb-8 max-w-md leading-relaxed">
                  Sem complicação. Sem código. Apenas você, seus produtos e uma
                  vitrine linda pronta para compartilhar.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <Clock className="w-5 h-5 text-white" strokeWidth={1.5} />
                    <span className="text-white font-medium">5 minutos</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <CheckCircle
                      className="w-5 h-5 text-white"
                      strokeWidth={1.5}
                    />
                    <span className="text-white font-medium">
                      Zero configuração
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute top-1/2 right-8 transform -translate-y-1/2">
                <div className="relative w-48 h-56 opacity-90 group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/20">
                      <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-2 bg-white/30 rounded w-3/4 mb-1"></div>
                        <div className="h-1.5 bg-white/20 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-20 bg-white/20 rounded-lg"></div>
                      <div className="h-2 bg-white/30 rounded w-2/3"></div>
                      <div className="h-2 bg-white/20 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-200 hover:border-violet-200 transition-all duration-500">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Palette className="w-7 h-7 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="font-plex text-xl font-semibold text-gray-900 mb-3">
                  Temas personalizados
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Escolha cores, fontes e layouts que representam sua marca. Sem
                  limites de criatividade.
                </p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-violet-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            </div>
            <div className="group relative overflow-hidden bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-200 hover:border-violet-200 transition-all duration-500">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Smartphone className="w-7 h-7 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="font-plex text-xl font-semibold text-gray-900 mb-3">
                  100% responsivo
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Sua vitrine fica perfeita em celulares, tablets e desktops.
                  Automaticamente.
                </p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-violet-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            </div>
            <div className="md:col-span-2 group relative overflow-hidden bg-gradient-to-br from-gray-50 to-violet-50/30 rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-200 hover:border-violet-200 transition-all duration-500">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Link2 className="w-7 h-7 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-plex text-2xl tracking-tight font-semibold text-gray-900 mb-4">
                    Link único e profissional
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Receba instantaneamente um endereço exclusivo para
                    compartilhar onde quiser.
                  </p>
                </div>
                <div className="relative">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md group-hover:scale-105 transition-transform duration-500">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
                        <span className="text-sm text-gray-700 font-medium">
                          suavitrine.com/
                          <span className="text-violet-600">sualoja</span>
                        </span>
                      </div>
                      <button className="p-3 bg-violet-500 rounded-lg hover:bg-violet-600 transition">
                        <Copy className="w-4 h-4 text-white" strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-2 bg-violet-100 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-violet-500 rounded-full"></div>
                      </div>
                      <div className="flex-1 h-2 bg-violet-100 rounded-full overflow-hidden">
                        <div className="h-full w-1/2 bg-violet-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-200 hover:border-violet-200 transition-all duration-500">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <BarChart3 className="w-7 h-7 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="font-plex text-xl font-semibold text-gray-900 mb-3">
                  Análises integradas
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Acompanhe visitas, cliques e engajamento em tempo real.
                </p>
                <div className="flex items-center gap-2 text-sm text-violet-600 font-medium">
                  <span>Ver exemplo</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-violet-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-white via-violet-50/20 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 border border-violet-200 rounded-full mb-4">
              <TrendingUp className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
              <span className="text-sm text-violet-700 font-medium">Preços</span>
            </div>
            <h2 className="font-plex text-4xl tracking-tight font-semibold text-gray-900 mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comece grátis e cresça conforme sua necessidade. Todos os planos
              incluem tudo que você precisa para vender online.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 flex flex-col">
              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-violet-500" strokeWidth={1.5} />
                </div>
                <h3 className="font-plex text-2xl font-semibold text-gray-900 mb-2">
                  Starter
                </h3>
                <p className="text-gray-600 text-sm">
                  Perfeito para começar
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-plex text-4xl font-semibold text-gray-900">
                    R$ 0
                  </span>
                  <span className="text-gray-500">/mês</span>
                </div>
                <p className="text-sm text-gray-500">Grátis para sempre</p>
              </div>

              <a
                href="https://app.suavitrine.tech"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-white text-violet-600 font-medium rounded-lg border-2 border-violet-200 hover:border-violet-300 hover:bg-violet-50 transition mb-8"
              >
                Começar grátis
              </a>

              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-gray-700">1 vitrine virtual</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-gray-700">Até 10 produtos</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-gray-700">Personalização básica</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-gray-700">Link compartilhável</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-gray-700">Suporte por email</span>
                </div>
              </div>
            </div>

            {/* Professional Plan - Most Popular */}
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl p-8 border-2 border-violet-400 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 flex flex-col relative overflow-hidden">
              {/* Popular Badge */}
              <div className="absolute top-6 right-6">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" strokeWidth={1.5} />
                  <span className="text-xs text-white font-medium">Mais Popular</span>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-400/50 to-purple-700/50 rounded-3xl blur-xl opacity-50"></div>

              <div className="relative z-10 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                  <Rocket className="w-7 h-7 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="font-plex text-2xl font-semibold text-white mb-2">
                  Professional
                </h3>
                <p className="text-violet-100 text-sm">
                  Para negócios em crescimento
                </p>
              </div>

              <div className="relative z-10 mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-plex text-4xl font-semibold text-white">
                    R$ 19
                  </span>
                  <span className="text-violet-100">/mês</span>
                </div>
                <p className="text-sm text-violet-100">Cobrança mensal</p>
              </div>

              <a
                href="https://app.suavitrine.tech"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-white text-violet-600 font-medium rounded-lg hover:bg-gray-50 transition shadow-lg mb-8 relative z-10"
              >
                Começar agora
              </a>

              <div className="relative z-10 flex-1 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-white">Produtos e categorias ilimitados</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-white">Personalização avançada</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-white">Domínio personalizado</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-white">Dashboard de analytics</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-white">Suporte prioritário</span>
                </div>
              </div>
            </div>

            {/* Premium AI Plan */}
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 flex flex-col relative overflow-hidden">
              {/* AI Badge */}
              <div className="absolute top-6 right-6">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full">
                  <Bot className="w-4 h-4 text-white" strokeWidth={1.5} />
                  <span className="text-xs text-white font-medium">IA Premium</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4">
                  <Crown className="w-7 h-7 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="font-plex text-2xl font-semibold text-gray-900 mb-2">
                  Premium AI
                </h3>
                <p className="text-gray-600 text-sm">
                  Potenciado por Inteligência Artificial
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-plex text-4xl font-semibold text-gray-900">
                    R$ 49
                  </span>
                  <span className="text-gray-500">/mês</span>
                </div>
                <p className="text-sm text-gray-500">Cobrança mensal</p>
              </div>

              <a
                href="https://app.suavitrine.tech"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-lg hover:from-violet-600 hover:to-purple-700 transition shadow-lg mb-8"
              >
                Começar agora
              </a>

              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-gray-700">
                    <span className="font-semibold">Tudo do Professional</span>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-gray-700">
                    Descrições e títulos gerados por IA
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-gray-700">
                    Assistente de personalização por IA
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-gray-700">
                    Recomendações inteligentes de produtos
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-gray-700">Acesso antecipado a novas features</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-gray-700">
                    Gerente de sucesso dedicado
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center animate-fadeInUp">
            <p className="text-gray-600 mb-6">
              Todos os planos incluem garantia de satisfação de 30 dias. Sem
              perguntas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500 text-white font-medium rounded-lg hover:bg-violet-600 transition shadow-md">
                <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                Falar com vendas
              </button>
              <a
                href="#"
                className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-2"
              >
                Comparar planos
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
