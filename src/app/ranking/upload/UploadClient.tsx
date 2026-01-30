"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload, Camera, Check, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";

interface ExtractedData {
  distanceKm: number;
  paceSeconds: number;
  durationSeconds: number;
  calories?: number;
}

interface AnalysisResult {
  screenshotUrl: string;
  extracted: ExtractedData;
  rawText?: string;
}

export function UploadClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      processFile(droppedFile);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ranking/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "분석에 실패했습니다.");
      }

      if (!data.success) {
        throw new Error(data.error || "기록을 인식하지 못했습니다.");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirm = async () => {
    if (!result) return;

    setUploading(true);
    setError(null);

    try {
      const response = await fetch("/api/ranking/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          screenshotUrl: result.screenshotUrl,
          distanceKm: result.extracted.distanceKm,
          paceSeconds: result.extracted.paceSeconds,
          durationSeconds: result.extracted.durationSeconds,
          calories: result.extracted.calories,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "기록 저장에 실패했습니다.");
      }

      router.push("/ranking");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const formatPace = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}'${secs.toString().padStart(2, "0")}"`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border-2 border-red-500 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Upload Zone */}
      {!preview && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-border-dark rounded-lg p-12 text-center cursor-pointer bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-light dark:bg-primary-dark flex items-center justify-center">
              <Camera className="w-8 h-8 text-primary-dark dark:text-primary-light" />
            </div>
            <div>
              <p className="text-lg font-bold mb-1">
                스크린샷을 여기에 드래그하거나 클릭하세요
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                PNG, JPG, HEIC 등 모든 이미지 형식 지원
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview & Analysis */}
      {preview && !result && (
        <div className="flex flex-col gap-4">
          <div className="relative w-full aspect-[9/16] max-h-[500px] mx-auto rounded-lg overflow-hidden border-2 border-border-dark shadow-(--shadow-neobrutalism)">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setError(null);
              }}
              className="flex-1 px-4 py-3 border-2 border-border-dark bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              다시 선택
            </button>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex-1 px-4 py-3 border-2 border-border-dark bg-primary-light dark:bg-primary-dark text-primary-dark dark:text-primary-light font-bold rounded-lg shadow-(--shadow-neobrutalism) hover:shadow-(--shadow-neobrutalism-hover) hover:translate-x-px hover:translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  AI 분석하기
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-gray-900 border-2 border-border-dark rounded-lg shadow-(--shadow-neobrutalism) p-6">
            <h2 className="text-xl font-black uppercase mb-4">추출된 기록</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">거리</p>
                <p className="text-2xl font-black">{result.extracted.distanceKm.toFixed(2)} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">페이스</p>
                <p className="text-2xl font-black">{formatPace(result.extracted.paceSeconds)} /km</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">시간</p>
                <p className="text-2xl font-black">{formatDuration(result.extracted.durationSeconds)}</p>
              </div>
              {result.extracted.calories && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">칼로리</p>
                  <p className="text-2xl font-black">{result.extracted.calories} kcal</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setResult(null);
                setError(null);
              }}
              className="flex-1 px-4 py-3 border-2 border-border-dark bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={uploading}
              className="flex-1 px-4 py-3 border-2 border-border-dark bg-accent-light dark:bg-accent-dark text-accent-dark dark:text-accent-light font-bold rounded-lg shadow-(--shadow-neobrutalism) hover:shadow-(--shadow-neobrutalism-hover) hover:translate-x-px hover:translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  확인 및 등록
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
