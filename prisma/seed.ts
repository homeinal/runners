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

type RegistrationStatus = "open" | "closed" | "unknown";

function calculateRegistrationStatus(
  registrationStart: string | null,
  registrationEnd: string | null
): RegistrationStatus {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (!registrationStart || !registrationEnd) {
    return "unknown";
  }

  const startDate = new Date(registrationStart);
  const endDate = new Date(registrationEnd);

  if (now >= startDate && now <= endDate) {
    return "open";
  }

  if (now > endDate) {
    return "closed";
  }

  return "unknown";
}

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseEventStartAt(race: RawRace): Date {
  if (race.eventDateTime) {
    const parsed = parseDate(race.eventDateTime);
    if (parsed) return parsed;
  }

  if (race.eventDate && race.eventTime) {
    const parsed = parseDate(`${race.eventDate}T${race.eventTime}`);
    if (parsed) return parsed;
  }

  return new Date(race.eventDate);
}

async function main() {
  console.log("Seeding database...");

  const jsonPath = path.join(__dirname, "..", "roadrun_2026.json");
  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const races: RawRace[] = JSON.parse(rawData);

  console.log(`Found ${races.length} races to import`);

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
        eventStartAt: parseEventStartAt(race),
        eventTimezone: "Asia/Seoul",
        eventTimeRaw: race.eventTime || null,
        country: race.country,
        region: race.region || null,
        venue: race.venue || null,
        registrationStatus,
        registrationStartAt: parseDate(race.registrationStart),
        registrationEndAt: parseDate(race.registrationEnd),
        categoriesRaw: race.categories || [],
        organizer: race.organizer || "Unknown",
        organizerRep: race.organizerRep || null,
        phone: race.phone || null,
        email: race.email || null,
        website: race.website || null,
      };

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

      console.log(`OK ${race.title}`);
    } catch (error) {
      failed++;
      console.error(`Failed: ${race.title}`, error);
    }
  }

  console.log("\nSummary:");
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total: ${races.length}`);
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
