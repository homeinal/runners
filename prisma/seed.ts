import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 국내 마라톤 대회 샘플 데이터
// 실제 데이터는 크롤러(runner_db/crawler.js)를 통해 수집됩니다
const races = [
  {
    title: "서울 국제 마라톤",
    titleEn: "Seoul International Marathon",
    description: "서울의 중심부를 달리는 대한민국 대표 마라톤 대회입니다.",
    eventDate: new Date("2025-03-16"),
    eventTime: "오전 08:00",
    country: "대한민국",
    region: "서울",
    city: "서울",
    venue: "광화문 광장",
    registrationStatus: "접수 중",
    registrationStart: new Date("2024-11-01"),
    registrationEnd: new Date("2025-02-28"),
    categories: ["풀 마라톤", "하프 마라톤", "10K"],
    organizer: "대한육상연맹",
    organizerRep: "김철수",
    phone: "02-414-3036",
    email: "info@seoul-marathon.com",
    website: "https://seoul-marathon.com",
    isFeatured: true,
    isUrgent: false,
  },
  {
    title: "제주 올레 마라톤",
    titleEn: "Jeju Olle Marathon",
    description: "제주도의 아름다운 해안 올레길을 따라 달리는 특별한 마라톤입니다.",
    eventDate: new Date("2025-04-05"),
    eventTime: "오전 07:00",
    country: "대한민국",
    region: "제주",
    city: "서귀포",
    venue: "서귀포 올레 시장",
    registrationStatus: "얼리버드",
    registrationStart: new Date("2025-01-01"),
    registrationEnd: new Date("2025-03-20"),
    categories: ["풀 마라톤", "하프 마라톤", "10K", "5K"],
    organizer: "제주 올레 재단",
    organizerRep: "박영희",
    phone: "064-762-2190",
    email: "info@jejuolle.org",
    website: "https://www.jejuolle.org",
    isFeatured: true,
    isUrgent: false,
  },
  {
    title: "부산 국제 마라톤",
    titleEn: "Busan International Marathon",
    description: "해운대 해변을 따라 달리는 아름다운 코스의 마라톤 대회입니다.",
    eventDate: new Date("2025-05-10"),
    eventTime: "오전 07:30",
    country: "대한민국",
    region: "부산",
    city: "부산",
    venue: "해운대 해수욕장",
    registrationStatus: "접수 중",
    registrationStart: new Date("2025-02-01"),
    registrationEnd: new Date("2025-04-30"),
    categories: ["풀 마라톤", "하프 마라톤", "10K"],
    organizer: "부산광역시체육회",
    organizerRep: "이순신",
    phone: "051-500-2000",
    email: "info@busan-marathon.com",
    website: "https://busan-marathon.com",
    isFeatured: false,
    isUrgent: false,
  },
  {
    title: "춘천 마라톤",
    titleEn: "Chuncheon Marathon",
    description: "의암호와 소양호를 따라 달리는 아름다운 호반 마라톤입니다.",
    eventDate: new Date("2025-10-26"),
    eventTime: "오전 08:00",
    country: "대한민국",
    region: "강원",
    city: "춘천",
    venue: "춘천종합운동장",
    registrationStatus: "접수 중",
    registrationStart: new Date("2025-07-01"),
    registrationEnd: new Date("2025-10-15"),
    categories: ["풀 마라톤", "하프 마라톤", "10K"],
    organizer: "춘천시체육회",
    organizerRep: "강감찬",
    phone: "033-250-3000",
    email: "info@chuncheon-marathon.com",
    website: "https://chuncheon-marathon.com",
    isFeatured: false,
    isUrgent: false,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const race of races) {
    await prisma.race.create({
      data: race,
    });
    console.log(`✅ Created race: ${race.title}`);
  }

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
