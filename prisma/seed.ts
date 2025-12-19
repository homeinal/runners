import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface RawRace {
  url: string;
  title: string;
  courseCategories: string;
  organizerRep: string;
  email: string;
  eventDateTime: string;
  phone: string;
  categories: string[];
  region: string;
  venue: string;
  organizer: string;
  registrationPeriod: string;
  website: string;
  country: string;
  registrationStart: string;
  registrationEnd: string;
  eventDate: string;
  eventTime: string;
}

function calculateRegistrationStatus(
  registrationStart: string | null,
  registrationEnd: string | null
): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (!registrationStart || !registrationEnd) {
    return "정보 없음";
  }

  const startDate = new Date(registrationStart);
  const endDate = new Date(registrationEnd);

  if (now < startDate) {
    return "접수 예정";
  } else if (now >= startDate && now <= endDate) {
    return "접수 중";
  } else {
    return "마감";
  }
}

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Read JSON file
  const jsonPath = path.join(__dirname, "..", "roadrun_2026.json");
  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const races: RawRace[] = JSON.parse(rawData);

  console.log(`📄 Found ${races.length} races to import`);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const race of races) {
    try {
      const registrationStatus = calculateRegistrationStatus(
        race.registrationStart,
        race.registrationEnd
      );

      const data = {
        title: race.title,
        sourceUrl: race.url,
        eventDate: new Date(race.eventDate),
        eventTime: race.eventTime || null,
        country: race.country,
        region: race.region || null,
        venue: race.venue || null,
        registrationStatus,
        registrationStart: parseDate(race.registrationStart),
        registrationEnd: parseDate(race.registrationEnd),
        legacyCategories: race.categories || [],
        organizer: race.organizer || null,
        organizerRep: race.organizerRep || null,
        phone: race.phone || null,
        email: race.email || null,
        website: race.website || null,
      };

      // Upsert by sourceUrl
      const result = await prisma.race.upsert({
        where: { sourceUrl: race.url },
        update: data,
        create: data,
      });

      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        created++;
      } else {
        updated++;
      }

      console.log(`✅ ${race.title}`);
    } catch (error) {
      failed++;
      console.error(`❌ Failed: ${race.title}`, error);
    }
  }

  console.log("\n📊 Summary:");
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${races.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
