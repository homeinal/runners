/**
 * 데이터 마이그레이션 스크립트
 *
 * 기존 Race 데이터를 새 RaceCategory/RaceSchedule 구조로 마이그레이션합니다.
 *
 * 실행: npx ts-node prisma/migrate-data.ts
 */

import { PrismaClient, CategoryStatus, ScheduleType } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 현재 날짜 기준으로 CategoryStatus 계산
 */
function calculateCategoryStatus(
  registrationStart: Date | null,
  registrationEnd: Date | null
): CategoryStatus {
  const now = new Date();

  if (!registrationStart || !registrationEnd) {
    return CategoryStatus.UPCOMING;
  }

  if (now < registrationStart) {
    return CategoryStatus.UPCOMING;
  } else if (now >= registrationStart && now <= registrationEnd) {
    return CategoryStatus.OPEN;
  } else {
    return CategoryStatus.CLOSED;
  }
}

async function migrateData() {
  console.log("🚀 데이터 마이그레이션 시작...\n");

  // 1. 기존 Race 데이터 조회
  const races = await prisma.race.findMany({
    include: {
      categories: true, // 이미 마이그레이션된 카테고리가 있는지 확인
    },
  });

  console.log(`📊 총 ${races.length}개 대회 발견\n`);

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const race of races) {
    try {
      // 이미 카테고리가 있으면 스킵
      if (race.categories.length > 0) {
        console.log(`⏭️  [${race.title}] 이미 마이그레이션됨 (${race.categories.length}개 카테고리)`);
        skippedCount++;
        continue;
      }

      // legacyCategories가 없으면 기본 카테고리 생성
      const categoryNames = race.legacyCategories.length > 0
        ? race.legacyCategories
        : ["기본"];

      console.log(`📦 [${race.title}] 마이그레이션 중... (${categoryNames.length}개 종목)`);

      // 각 카테고리에 대해 RaceCategory 생성
      for (const categoryName of categoryNames) {
        const status = calculateCategoryStatus(
          race.registrationStart,
          race.registrationEnd
        );

        // RaceCategory 생성
        const raceCategory = await prisma.raceCategory.create({
          data: {
            raceId: race.id,
            name: categoryName,
            status: status,
            // 캐시 필드 설정
            nextRegistrationAt: race.registrationStart,
            nextRegistrationEndAt: race.registrationEnd,
          },
        });

        // RaceSchedule 생성 (접수 일정)
        if (race.registrationStart || race.registrationEnd) {
          await prisma.raceSchedule.create({
            data: {
              categoryId: raceCategory.id,
              type: ScheduleType.REGISTRATION,
              startAt: race.registrationStart,
              endAt: race.registrationEnd,
              label: "접수",
            },
          });
        }
      }

      console.log(`   ✅ 완료: ${categoryNames.join(", ")}`);
      migratedCount++;

    } catch (error) {
      console.error(`   ❌ 오류: ${race.title}`, error);
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 마이그레이션 결과");
  console.log("=".repeat(50));
  console.log(`   마이그레이션됨: ${migratedCount}`);
  console.log(`   스킵됨 (이미 완료): ${skippedCount}`);
  console.log(`   오류: ${errorCount}`);
  console.log(`   총: ${races.length}`);
}

async function verifyMigration() {
  console.log("\n" + "=".repeat(50));
  console.log("🔍 마이그레이션 검증");
  console.log("=".repeat(50));

  const racesWithCategories = await prisma.race.findMany({
    include: {
      categories: {
        include: {
          schedules: true,
        },
      },
    },
    take: 5,
  });

  console.log(`\n처음 5개 대회 샘플:\n`);

  for (const race of racesWithCategories) {
    console.log(`📌 ${race.title}`);
    console.log(`   레거시 카테고리: [${race.legacyCategories.join(", ")}]`);
    console.log(`   새 카테고리: ${race.categories.length}개`);

    for (const cat of race.categories) {
      console.log(`   - ${cat.name} (${cat.status})`);
      for (const sch of cat.schedules) {
        console.log(`     └ ${sch.type}: ${sch.startAt?.toISOString().split('T')[0] || '?'} ~ ${sch.endAt?.toISOString().split('T')[0] || '?'}`);
      }
    }
    console.log();
  }

  // 통계
  const totalCategories = await prisma.raceCategory.count();
  const totalSchedules = await prisma.raceSchedule.count();

  console.log("=".repeat(50));
  console.log(`총 RaceCategory: ${totalCategories}개`);
  console.log(`총 RaceSchedule: ${totalSchedules}개`);
}

async function main() {
  try {
    console.log("이 스크립트는 로컬/수동 실행용입니다. CI에서는 건너뜀.");
    process.exit(0);
    await migrateData();
    await verifyMigration();
  } catch (error) {
    console.error("마이그레이션 실패:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
