// @ts-nocheck
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Header, Footer } from "@/components/layout";
import { RaceDetail } from "@/components/features/races";
import { Icon } from "@/components/ui/Icon";

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const race = await prisma.race.findUnique({
    where: { id },
    include: {
      categories: true,
    },
  });

  if (!race) {
    return { title: "대회를 찾을 수 없습니다 - 매달" };
  }

  return {
    title: `${race.title} - 매달`,
    description: `${race.region || race.country}에서 열리는 ${race.title} 대회 정보`,
    openGraph: {
      title: race.title,
      description: `${race.region || race.country}에서 열리는 ${race.title} 대회`,
      images: race.imageUrl ? [race.imageUrl] : [],
    },
  };
}

export default async function RaceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const race = await prisma.race.findUnique({
    where: { id },
    include: {
      categories: true,
    },
  });

  if (!race) {
    notFound();
  }

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: race.title,
    startDate: race.eventStartAt.toISOString(),
    location: {
      "@type": "Place",
      name: race.venue || race.region,
      address: {
        "@type": "PostalAddress",
        addressRegion: race.region,
        addressCountry: race.country,
      },
    },
    organizer: race.organizer
      ? {
          "@type": "Organization",
          name: race.organizer,
        }
      : undefined,
    url: race.website,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="layout-container flex flex-col w-full max-w-3xl mx-auto p-4 md:p-8 lg:p-12 gap-6">
        {/* Breadcrumb */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-2 md:gap-0">
          <Link
            href="/"
            className="group flex items-center gap-2 font-bold text-sm uppercase tracking-wide hover:underline"
          >
            <Icon
              name="arrow_back"
              className="text-lg group-hover:-translate-x-1 transition-transform"
            />
            대회 목록으로
          </Link>
          <div className="flex gap-2 text-sm font-bold uppercase opacity-60">
            <span>홈</span> / <span>{race.country}</span> /{" "}
            <span>{race.region}</span>
          </div>
        </div>

        {/* Race Detail */}
        <RaceDetail race={race} />

      </main>
      <Footer />
    </>
  );
}
