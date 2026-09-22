import React, { useState } from "react";
import { X, Save, Upload, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DOMAIN_LABELS } from "@/lib/curriculum";

interface QuestionFormModalProps {
  editingQuestionId: string | null;
  initialValues?: any;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function QuestionFormModal({
  editingQuestionId,
  initialValues = {},
  onClose,
  onSuccess,
  onError,
}: QuestionFormModalProps) {
  const isEditing = Boolean(editingQuestionId);

  const [qDomain, setQDomain] = useState(initialValues.domain || "NUMERICAL_REASONING");
  const [qSubtopic, setQSubtopic] = useState(initialValues.subtopic || "percentages");
  const [qDifficulty, setQDifficulty] = useState(initialValues.difficulty || "MODERATE");
  const [qQualityStatus, setQQualityStatus] = useState(initialValues.qualityStatus || "ACTIVE");
  const [qPrompt, setQPrompt] = useState(initialValues.prompt || "");
  const [qImageUrl, setQImageUrl] = useState(initialValues.image || "");
  const [qImagePos, setQImagePos] = useState<"ABOVE_QUESTION" | "BELOW_QUESTION" | "INLINE">(
    initialValues.imagePosition || "ABOVE_QUESTION"
  );
  const [qSvgData, setQSvgData] = useState(initialValues.svgData || "");

  const optA = initialValues.options?.find((o: any) => o.id === "A");
  const optB = initialValues.options?.find((o: any) => o.id === "B");
  const optC = initialValues.options?.find((o: any) => o.id === "C");
  const optD = initialValues.options?.find((o: any) => o.id === "D");

  const [qOptionA, setQOptionA] = useState(optA?.text || "");
  const [qOptionAImage, setQOptionAImage] = useState(optA?.image || "");
  const [qOptionB, setQOptionB] = useState(optB?.text || "");
  const [qOptionBImage, setQOptionBImage] = useState(optB?.image || "");
  const [qOptionC, setQOptionC] = useState(optC?.text || "");
  const [qOptionCImage, setQOptionCImage] = useState(optC?.image || "");
  const [qOptionD, setQOptionD] = useState(optD?.text || "");
  const [qOptionDImage, setQOptionDImage] = useState(optD?.image || "");

  const [qCorrectAnswer, setQCorrectAnswer] = useState(initialValues.correctAnswer || "A");
  const [qExplanation, setQExplanation] = useState(initialValues.explanation || "");
  const [qSolvingStrategy, setQSolvingStrategy] = useState(initialValues.solvingStrategy || "");
  const [changeReason, setChangeReason] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "main" | "A" | "B" | "C" | "D") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/images/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        if (target === "main") setQImageUrl(data.url);
        else if (target === "A") setQOptionAImage(data.url);
        else if (target === "B") setQOptionBImage(data.url);
        else if (target === "C") setQOptionCImage(data.url);
        else if (target === "D") setQOptionDImage(data.url);
      } else {
        alert(data.error || "Gagal mengunggah gambar.");
      }
    } catch {
      alert("Kesalahan koneksi saat mengunggah gambar.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const options = [
      { id: "A", text: qOptionA, image: qOptionAImage || undefined },
      { id: "B", text: qOptionB, image: qOptionBImage || undefined },
      { id: "C", text: qOptionC, image: qOptionCImage || undefined },
      { id: "D", text: qOptionD, image: qOptionDImage || undefined },
    ].filter((o) => o.text.trim() || o.image);

    const payload: any = {
      domain: qDomain,
      subtopic: qSubtopic,
      difficulty: qDifficulty,
      qualityStatus: qQualityStatus,
      prompt: qPrompt,
      image: qImageUrl || null,
      imagePosition: qImagePos,
      svgData: qSvgData || null,
      options,
      correctAnswer: qCorrectAnswer,
      explanation: qExplanation,
      solvingStrategy: qSolvingStrategy,
    };

    if (isEditing) {
      payload.id = editingQuestionId;
      payload.changeReason = changeReason || "Pembaruan oleh administrator";
    }

    try {
      const res = await fetch("/api/admin/questions", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess(isEditing ? `Soal ${editingQuestionId} berhasil diperbarui.` : "Butir soal baru berhasil disimpan.");
        onClose();
      } else {
        onError(data.error || "Gagal menyimpan soal.");
      }
    } catch (err: any) {
      onError(err.message || "Kesalahan jaringan saat menyimpan soal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-3xl w-full max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isEditing ? `Sunting Butir Soal (${editingQuestionId})` : "Tambah Butir Soal Baru"}
            </h3>
            <p className="text-[11px] text-slate-500">
              Isi data butir soal dan penjelasan solusi transparan.
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Metadata Section */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Domain Kognitif</label>
              <select
                value={qDomain}
                onChange={(e) => setQDomain(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
              >
                {Object.entries(DOMAIN_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Subtopik / Tag</label>
              <input
                type="text"
                value={qSubtopic}
                onChange={(e) => setQSubtopic(e.target.value)}
                placeholder="percentages, etc."
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tingkat Kesulitan</label>
              <select
                value={qDifficulty}
                onChange={(e) => setQDifficulty(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
              >
                <option value="EASY">EASY (Mudah)</option>
                <option value="MODERATE">MODERATE (Sedang)</option>
                <option value="HARD">HARD (Sulit)</option>
                <option value="VERY_HARD">VERY HARD (Sangat Sulit)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Status Mutu</label>
              <select
                value={qQualityStatus}
                onChange={(e) => setQQualityStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
              >
                <option value="ACTIVE">ACTIVE (Aktif Terverifikasi)</option>
                <option value="REVIEW_REQUIRED">REVIEW_REQUIRED (Perlu Ditinjau)</option>
                <option value="DRAFT">DRAFT (Konsep)</option>
                <option value="DEPRECATED">DEPRECATED (Usang)</option>
              </select>
            </div>
          </div>

          {/* Prompt Section */}
          <div className="space-y-1">
            <label className="block text-slate-700 font-semibold">
              Teks Pertanyaan (Prompt) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={qPrompt}
              onChange={(e) => setQPrompt(e.target.value)}
              placeholder="Tuliskan teks stimulus atau pertanyaan di sini..."
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>

          {/* Stimulus & Image Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold flex items-center justify-between">
                <span>URL Gambar Stimulus (Opsional)</span>
                <label className="text-blue-700 cursor-pointer hover:underline text-[10px] inline-flex items-center">
                  <Upload className="h-2.5 w-2.5 mr-1" />
                  {isUploadingImage ? "Mengunggah..." : "Unggah File"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "main")}
                  />
                </label>
              </label>
              <input
                type="text"
                value={qImageUrl}
                onChange={(e) => setQImageUrl(e.target.value)}
                placeholder="/uploads/questions/... atau URL https://"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold">Markup SVG Stimulus (Opsional)</label>
              <input
                type="text"
                value={qSvgData}
                onChange={(e) => setQSvgData(e.target.value)}
                placeholder="<svg viewBox='...'>...</svg>"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Options Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-slate-700 font-bold">
                Opsi Pilihan Ganda & Kunci Jawaban <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500 font-semibold">Kunci Benar:</span>
                {["A", "B", "C", "D"].map((choice) => (
                  <label key={choice} className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="correctAnswerGroup"
                      value={choice}
                      checked={qCorrectAnswer === choice}
                      onChange={(e) => setQCorrectAnswer(e.target.value)}
                    />
                    <span className="font-bold">{choice}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opsi A */}
              <div className={`p-3 rounded-lg border ${qCorrectAnswer === "A" ? "border-blue-400 bg-blue-50/50" : "border-slate-200"}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-700">Opsi A</span>
                  <label className="text-blue-700 cursor-pointer text-[10px] inline-flex items-center">
                    <ImageIcon className="h-2.5 w-2.5 mr-1" />
                    + Gambar
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "A")} />
                  </label>
                </div>
                <input
                  type="text"
                  value={qOptionA}
                  onChange={(e) => setQOptionA(e.target.value)}
                  placeholder="Teks opsi A..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              {/* Opsi B */}
              <div className={`p-3 rounded-lg border ${qCorrectAnswer === "B" ? "border-blue-400 bg-blue-50/50" : "border-slate-200"}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-700">Opsi B</span>
                  <label className="text-blue-700 cursor-pointer text-[10px] inline-flex items-center">
                    <ImageIcon className="h-2.5 w-2.5 mr-1" />
                    + Gambar
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "B")} />
                  </label>
                </div>
                <input
                  type="text"
                  value={qOptionB}
                  onChange={(e) => setQOptionB(e.target.value)}
                  placeholder="Teks opsi B..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              {/* Opsi C */}
              <div className={`p-3 rounded-lg border ${qCorrectAnswer === "C" ? "border-blue-400 bg-blue-50/50" : "border-slate-200"}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-700">Opsi C</span>
                  <label className="text-blue-700 cursor-pointer text-[10px] inline-flex items-center">
                    <ImageIcon className="h-2.5 w-2.5 mr-1" />
                    + Gambar
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "C")} />
                  </label>
                </div>
                <input
                  type="text"
                  value={qOptionC}
                  onChange={(e) => setQOptionC(e.target.value)}
                  placeholder="Teks opsi C..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              {/* Opsi D */}
              <div className={`p-3 rounded-lg border ${qCorrectAnswer === "D" ? "border-blue-400 bg-blue-50/50" : "border-slate-200"}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-700">Opsi D</span>
                  <label className="text-blue-700 cursor-pointer text-[10px] inline-flex items-center">
                    <ImageIcon className="h-2.5 w-2.5 mr-1" />
                    + Gambar
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "D")} />
                  </label>
                </div>
                <input
                  type="text"
                  value={qOptionD}
                  onChange={(e) => setQOptionD(e.target.value)}
                  placeholder="Teks opsi D..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Solutions & Explanation Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold">
                Penjelasan Solusi (Explanation) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={qExplanation}
                onChange={(e) => setQExplanation(e.target.value)}
                placeholder="Jabarkan langkah demi langkah solusi soal untuk transparansi kunci..."
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold">Strategi Cepat (Solving Strategy)</label>
              <textarea
                rows={3}
                value={qSolvingStrategy}
                onChange={(e) => setQSolvingStrategy(e.target.value)}
                placeholder="Tips pemecahan cepat atau eliminasi opsi..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Change Reason (for edits) */}
          {isEditing && (
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <label className="block text-slate-700 font-semibold">Alasan Pembaruan (Version Snapshot Note)</label>
              <input
                type="text"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Contoh: Klarifikasi gambar yang kabur berdasarkan laporan peserta"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <Button size="sm" type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button size="sm" type="submit" disabled={isSubmitting} className="bg-blue-900 hover:bg-blue-800 text-white">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  <span>{isEditing ? "Perbarui Butir Soal" : "Simpan Butir Soal"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
