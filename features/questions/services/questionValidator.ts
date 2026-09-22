/**
 * Single Responsibility: Validation logic for Question activation and data integrity.
 */
export function validateQuestionForActivation(data: {
  prompt?: string;
  options?: any[];
  correctAnswer?: string;
  explanation?: string;
}): string[] {
  const errors: string[] = [];

  if (!data.prompt || data.prompt.trim().length === 0) {
    errors.push("Teks soal (prompt) tidak boleh kosong.");
  }

  if (!data.options || !Array.isArray(data.options) || data.options.length < 2) {
    errors.push("Soal harus memiliki minimal 2 opsi jawaban.");
  } else {
    const optionIds = data.options.map((o) => o.id);
    if (!data.correctAnswer || !optionIds.includes(data.correctAnswer)) {
      errors.push(
        `Kunci jawaban ('${data.correctAnswer}') harus cocok dengan salah satu opsi (${optionIds.join(", ")}).`
      );
    }
  }

  if (!data.explanation || data.explanation.trim().length === 0) {
    errors.push("Penjelasan solusi (explanation) wajib diisi untuk transparansi kunci jawaban.");
  }

  return errors;
}
