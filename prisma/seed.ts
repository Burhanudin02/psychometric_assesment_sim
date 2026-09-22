import { PrismaClient, Difficulty, QuestionType, UserRole, UserStatus, QualityStatus, ReportReason, ReportStatus } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function main() {
  console.log("Seeding database with Cognitive Assessment Simulator v0.1.0-beta assets...");

  // 1. Seed Administrator User
  const adminEmail = process.env.ADMIN_EMAIL || "admin@simulator.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminPass123!";
  const adminHash = hashPassword(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      displayName: "System Administrator",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      anonymousToken: "bootstrap_admin_token_001",
    },
  });
  console.log(`[Seed] Admin user ready: ${adminEmail} (Role: ADMIN)`);

  // 2. Seed Demo Candidate User
  const demoEmail = "user@simulator.local";
  const demoHash = hashPassword("UserPass123!");

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: demoEmail,
      passwordHash: demoHash,
      displayName: "Demo Candidate",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      anonymousToken: "demo_candidate_token_001",
    },
  });
  console.log(`[Seed] Demo Candidate ready: ${demoEmail} (Role: USER)`);

  // 3. Seed Anonymous Candidate
  await prisma.user.upsert({
    where: { anonymousToken: "demo-candidate-token-001" },
    update: {},
    create: {
      anonymousToken: "demo-candidate-token-001",
      displayName: "Simulated Candidate",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    },
  });

  // 4. Seed Questions with Quality Status
  const questionsPath = path.join(__dirname, "../data/seedQuestions.json");
  if (fs.existsSync(questionsPath)) {
    const rawData = fs.readFileSync(questionsPath, "utf-8");
    const questions = JSON.parse(rawData);

    console.log(`[Seed] Found ${questions.length} questions to seed.`);
    for (const q of questions) {
      const qStatus = (q.qualityStatus as QualityStatus) || (q.active === false ? QualityStatus.DEPRECATED : QualityStatus.ACTIVE);
      const isActive = q.active !== false && qStatus !== QualityStatus.DEPRECATED;

      const qRecord = await prisma.question.upsert({
        where: { id: q.id },
        update: {
          domain: q.domain,
          subtopic: q.subtopic,
          questionType: q.questionType as QuestionType,
          difficulty: q.difficulty as Difficulty,
          qualityStatus: qStatus,
          prompt: q.prompt,
          svgData: q.svgData || null,
          options: q.options,
          correctAnswer: q.correctAnswer,
          rule: q.rule || null,
          explanation: q.explanation,
          solvingStrategy: q.solvingStrategy,
          tags: q.tags || [],
          estimatedDifficulty: q.estimatedDifficulty || 2.5,
          active: isActive,
          version: q.version ?? 1,
        },
        create: {
          id: q.id,
          domain: q.domain,
          subtopic: q.subtopic,
          questionType: q.questionType as QuestionType,
          difficulty: q.difficulty as Difficulty,
          qualityStatus: qStatus,
          prompt: q.prompt,
          svgData: q.svgData || null,
          options: q.options,
          correctAnswer: q.correctAnswer,
          rule: q.rule || null,
          explanation: q.explanation,
          solvingStrategy: q.solvingStrategy,
          tags: q.tags || [],
          estimatedDifficulty: q.estimatedDifficulty || 2.5,
          active: isActive,
          version: q.version ?? 1,
        },
      });

      // Seed initial QuestionVersion snapshot if not present
      const existingVersion = await prisma.questionVersion.findUnique({
        where: {
          questionId_version: {
            questionId: qRecord.id,
            version: 1,
          },
        },
      });

      if (!existingVersion) {
        await prisma.questionVersion.create({
          data: {
            questionId: qRecord.id,
            version: 1,
            questionData: {
              prompt: qRecord.prompt,
              svgData: qRecord.svgData,
              options: qRecord.options,
              correctAnswer: qRecord.correctAnswer,
              rule: qRecord.rule,
              explanation: qRecord.explanation,
              solvingStrategy: qRecord.solvingStrategy,
              qualityStatus: qRecord.qualityStatus,
            },
            changedBy: admin.id,
            changeReason: "Initial seed snapshot",
          },
        });
      }
    }
    console.log("[Seed] Seeded all original questions and version snapshots.");
  }

  // 5. Seed Demonstration Question Report
  const sampleQuestion = await prisma.question.findFirst({
    where: { domain: "ABSTRACT_REASONING" },
  });

  if (sampleQuestion) {
    const existingReport = await prisma.questionReport.findFirst({
      where: { questionId: sampleQuestion.id, userId: demoUser.id },
    });

    if (!existingReport) {
      await prisma.questionReport.create({
        data: {
          questionId: sampleQuestion.id,
          questionVersion: 1,
          userId: demoUser.id,
          reason: ReportReason.IMAGE_UNCLEAR,
          comment: "Pola rotasi matriks figur 3x3 terlihat sedikit kabur pada monitor resolusi 1080p.",
          status: ReportStatus.OPEN,
        },
      });
      await prisma.question.update({
        where: { id: sampleQuestion.id },
        data: { reportCount: { increment: 1 } },
      });
      console.log(`[Seed] Demonstration QuestionReport created for ${sampleQuestion.id}.`);
    }
  }

  console.log("[Seed] Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
