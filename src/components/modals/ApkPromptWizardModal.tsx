import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Smartphone,
  Github,
  Terminal,
  Download,
  Flame,
} from 'lucide-react';
import { soundFx } from '../../utils/audioNotification';

interface ApkPromptWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkPromptWizardModal: React.FC<ApkPromptWizardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    soundFx.playPop();
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const PROMPT_1 = `Sen Android ve Web Finans geliştirme uzmanı bir yapay zekasın. 
Bana Android telefonumda çalışacak mükemmel bir Finans & Devirli Kasa Defteri uygulaması hazırlamanı istiyorum.
Uygulama şu yeteneklere sahip olmalı:
1. Devirli Kasa Defteri: Dünden/geçmişten devreden bakiye, günlük gelirler, giderler, gün sonu devir kapatma.
2. Kredi Kartı Yönetimi: Birden fazla kart ekleme/düzenleme/silme, banka adına göre otomatik akıllı renk (Garanti BBVA yeşil bonus, İş Bankası mavi maximum, Akbank kırmızı vb.), kart borcu ödendiğinde kullanılabilir limitin otomatik artması ve karttan harcama yapıldığında limitin otomatik düşmesi.
3. Kredi Borç Takibi: Çekilen kredi, toplam taksit, ödenen taksit ve kalan toplam borç. Taksit ödendiği zaman otomatik borç düşümü.
4. Fatura & Sabit Gider Takibi: Elektrik, su, doğalgaz, internet, kira, aidat vb. vadeleri, son ödeme yaklaştığında aciliyet durumuna göre sesli ve görsel alarm hatırlatıcısı.
5. GitHub Actions APK Entegrasyonu: Projede .github/workflows/build-apk.yml ve capacitor ayarları eksiksiz yer alsın. GitHub'a public repoya push edildiğinde Actions sekmesinden tek tıkla indirilebilir Android APK (app-debug.apk) üretsin.
6. Tasarım: Şık neon fosforlu patlıcan moru, fosforlu yeşil, canlı turuncu ve modern koyu fintech teması.`;

  const PROMPT_GITHUB_WORKFLOW = `name: Build Android APK (Release & Debug)

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build-apk:
    name: Build Android APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Setup Java JDK
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Install Dependencies
        run: |
          npm ci || npm install
          npm install -D @capacitor/core @capacitor/cli @capacitor/android

      - name: Build Web Assets (Vite)
        run: npm run build

      - name: Initialize Capacitor Android
        run: |
          npx cap init "Finans Takip" "com.finans.kasadefteri" --web-dir dist
          npx cap add android || true
          npx cap sync android

      - name: Build Debug APK with Gradle
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: Finans-Kasa-Defteri-Debug-APK
          path: android/app/build/outputs/apk/debug/app-debug.apk
          retention-days: 30`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#10101e] border border-purple-800/50 p-5 sm:p-7 shadow-2xl my-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 p-[1px] flex items-center justify-center shadow-lg shadow-purple-900/40">
            <div className="w-full h-full bg-[#10101e] rounded-[15px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              Android APK & AI Prompt Sihirbazı
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                HAZIR
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              GitHub Actions ile tek tıkla APK oluşturma ve yapay zeka promptları
            </p>
          </div>
        </div>

        {/* 404 Error Troubleshooting & Quick Fix Guide */}
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/50 mb-5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-black text-amber-300">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-black text-[10px]">404 ÇÖZÜMÜ</span>
            GitHub &quot;404 - This is not the web page you are looking for&quot; Hatası Neden Olur?
          </div>
          <div className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
            <p>
              • <strong>1. Proje henüz GitHub&apos;a aktarılmadı:</strong> Google AI Studio ekranının sağ üst köşesindeki <strong>üç nokta (...) / Ayarlar</strong> menüsünden <strong>&quot;Export to GitHub&quot;</strong> butonuna basarak projeyi kendi GitHub hesabınıza aktarmalısınız.
            </p>
            <p>
              • <strong>2. GitHub Girişi Yapılmadı:</strong> Eğer deponuz <em>Private (Gizli)</em> ise ve tarayıcınızda GitHub hesabınıza giriş yapmadıysanız GitHub güvenlik gereği 404 sayfası gösterir. Önce <a href="https://github.com/login" target="_blank" rel="noreferrer" className="text-amber-400 underline font-bold">github.com/login</a> adresinden giriş yapın.
            </p>
            <p>
              • <strong>3. Doğru Repo Linki:</strong> Projeyi GitHub&apos;a aktardıktan sonra adresiniz <code className="text-amber-200 bg-amber-900/60 px-1 py-0.5 rounded font-mono">https://github.com/KULLANICI-ADINIZ/REPO-ADINIZ</code> şeklinde olacaktır.
            </p>
          </div>
        </div>

        {/* Ready Notification Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-700/40 mb-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Check className="w-4 h-4 text-emerald-400" />
            Bu Projenin İçine GitHub Actions APK Dosyası Zaten Eklendi!
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Kök dizinde <code className="text-purple-300 font-mono bg-purple-950/80 px-1 py-0.5 rounded">.github/workflows/build-apk.yml</code> ve <code className="text-purple-300 font-mono bg-purple-950/80 px-1 py-0.5 rounded">capacitor.config.json</code> dosyalarınız tam olarak yapılandırıldı. GitHub&apos;a aktardığınız anda Actions sekmesinden APK otomatik derlenecektir.
          </p>
        </div>

        {/* 4 Steps to APK on GitHub */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Github className="w-4 h-4 text-purple-400" />
            GitHub ile 4 Adımda Android APK İndirme:
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">1</span>
                GitHub&apos;da Repo Açın
              </div>
              <p className="text-[11px] text-slate-400">
                github.com&apos;a girip yeni bir Public veya Private repository oluşturun.
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">2</span>
                Projeyi GitHub&apos;a Push Edin
              </div>
              <p className="text-[11px] text-slate-400">
                AI Studio&apos;dan Export GitHub seçeneğiyle veya git push ile repoya gönderin.
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">3</span>
                &quot;Actions&quot; Sekmesine Tıklayın
              </div>
              <p className="text-[11px] text-slate-400">
                GitHub&apos;da Actions sekmesine girin, &quot;Build Android APK&quot; işi otomatik çalışacaktır.
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">4</span>
                APK&apos;yı İndirin & Kurun
              </div>
              <p className="text-[11px] text-slate-400">
                Tamamlandığında alt kısımdaki &quot;Artifacts&quot; bölümünden APK&apos;yı indirip telefona yükleyin.
              </p>
            </div>
          </div>
        </div>

        {/* Copyable Prompts */}
        <div className="space-y-4">
          {/* Prompt 1 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                1. Google AI Studio / Gemini Yapay Zeka Promptu
              </span>
              <button
                onClick={() => handleCopy(PROMPT_1, 'prompt1')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all active:scale-95 shadow"
              >
                {copiedId === 'prompt1' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Promptu Kopyala</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-400 bg-slate-900/80 p-3 rounded-xl max-h-32 overflow-y-auto whitespace-pre-wrap">
              {PROMPT_1}
            </pre>
          </div>

          {/* Workflow Code */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                2. GitHub Actions YAML (.github/workflows/build-apk.yml)
              </span>
              <button
                onClick={() => handleCopy(PROMPT_GITHUB_WORKFLOW, 'workflow')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all active:scale-95 border border-slate-700"
              >
                {copiedId === 'workflow' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>YAML Kopyala</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-400 bg-slate-900/80 p-3 rounded-xl max-h-28 overflow-y-auto whitespace-pre-wrap">
              {PROMPT_GITHUB_WORKFLOW}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
