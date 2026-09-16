import { PrismaClient, Difficulty, QuestionType } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with original questions and curriculum blueprint...");

  // 1. Seed Questions
  const questionsPath = path.join(__dirname, "../data/seedQuestions.json");
  if (fs.existsSync(questionsPath)) {
    const rawData = fs.readFileSync(questionsPath, "utf-8");
    const questions = JSON.parse(rawData);

    console.log(`Found ${questions.length} questions to seed.`);
    for (const q of questions) {
      await prisma.question.upsert({
        where: { id: q.id },
        update: {
          domain: q.domain,
          subtopic: q.subtopic,
          questionType: q.questionType as QuestionType,
          difficulty: q.difficulty as Difficulty,
          prompt: q.prompt,
          svgData: q.svgData || null,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          solvingStrategy: q.solvingStrategy,
          tags: q.tags || [],
          estimatedDifficulty: q.estimatedDifficulty || 2.5,
          active: q.active ?? true,
          version: q.version ?? 1,
        },
        create: {
          id: q.id,
          domain: q.domain,
          subtopic: q.subtopic,
          questionType: q.questionType as QuestionType,
          difficulty: q.difficulty as Difficulty,
          prompt: q.prompt,
          svgData: q.svgData || null,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          solvingStrategy: q.solvingStrategy,
          tags: q.tags || [],
          estimatedDifficulty: q.estimatedDifficulty || 2.5,
          active: q.active ?? true,
          version: q.version ?? 1,
        },
      });
    }
    console.log("Seeded all 160+ original questions successfully.");
  }

  // 2. Create a default anonymous demo user
  const demoUser = await prisma.user.upsert({
    where: { anonymousToken: "demo-candidate-token-001" },
    update: {},
    create: {
      anonymousToken: "demo-candidate-token-001",
      displayName: "Simulated Candidate",
    },
  });
  console.log("Demo user ensured:", demoUser.id);
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
