import type { RaceWithCategories } from "@/types";
import {
  formatDate,
  formatRegistrationPeriod,
  getRaceRegistrationStatus,
  getRaceCategoryNames,
  getRaceRegistrationPeriod,
} from "@/lib/utils";
import { formatTime } from "@/lib/date";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface RaceDetailProps {
  race: RaceWithCategories;
}

export function RaceDetail({ race }: RaceDetailProps) {
  const eventDate = new Date(race.eventStartAt);
  const registrationStatus = getRaceRegistrationStatus(race);
  const categoryNames = getRaceCategoryNames(race);
  const { start: regStart, end: regEnd } = getRaceRegistrationPeriod(race);
  const eventTimeLabel =
    race.eventTimeRaw || (race.eventStartAt ? formatTime(race.eventStartAt) : null);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Title Section */}
      <Card variant="section" className="relative overflow-hidden group">
        {/* Watermark Icon */}
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-[150px] md:text-[200px] leading-none">
            sprint
          </span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Badge variant="category">마라톤</Badge>
          <Badge>로드 레이스</Badge>
        </div>

        {/* Title */}
        <h2 className="text-4xl md:text-6xl font-black uppercase leading-[1.1] tracking-tighter mb-6 break-words relative z-10">
          {race.title}
        </h2>

        {/* Date & Location */}
        <div className="flex flex-col md:flex-row gap-6 md:items-center mt-6 pt-6 border-t-2 border-black relative z-10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">
              calendar_month
            </span>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-lg">{formatDate(eventDate)}</span>
              <span className="text-sm font-medium uppercase text-gray-600">
                {eventTimeLabel || "시간 미정"}
              </span>
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-black mx-2" />

          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">
              location_on
            </span>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-lg">
                {race.country}, {race.region || "지역 미정"}
              </span>
              <span className="text-sm font-medium uppercase text-gray-600">
                {race.venue || "장소 미정"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Registration Section */}
      <section className="bg-primary border-2 border-border-dark shadow-[var(--shadow-neobrutalism)] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 w-full text-black dark:text-black">
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-black dark:text-black">
              app_registration
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase mb-0.5 text-black dark:text-black">
                접수 상태
              </span>
              <span className="bg-black text-white px-2 py-0.5 text-sm font-bold uppercase w-fit">
                {registrationStatus}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase text-black dark:text-black">기간</span>
            <div className="text-2xl font-black text-black dark:text-black">
              {formatRegistrationPeriod(regStart, regEnd)}
            </div>
            <p className="text-sm font-medium leading-tight mt-1 max-w-sm text-black dark:text-black">
              마감 전에 등록하세요. 추가 접수는 불가능합니다.
            </p>
          </div>
        </div>

        {race.website && (
          <div className="w-full md:w-auto flex flex-col items-center gap-2">
            <a
              href={race.website}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-full md:w-64 block"
            >
              <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 transition-transform group-hover:translate-x-2 group-hover:translate-y-2" />
              <div className="relative w-full bg-white border-2 border-black p-4 flex items-center justify-between hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform active:translate-x-1 active:translate-y-1 active:bg-gray-100">
                <span className="font-black text-lg uppercase">
                  공식 웹사이트
                </span>
                <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </a>
            <div className="text-[10px] uppercase font-bold opacity-60">
              외부 링크 • 새 탭에서 열림
            </div>
          </div>
        )}
      </section>

      {/* Categories Section */}
      {categoryNames.length > 0 && (
        <Card variant="section">
          <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">category</span>
            종목
          </h3>
          <div className="flex flex-wrap gap-3">
            {categoryNames.map((categoryName) => (
              <div key={categoryName} className="group relative cursor-pointer">
                <div className="absolute inset-0 bg-black dark:bg-white rounded-full translate-x-1 translate-y-1" />
                <div className="relative bg-white dark:bg-white border-2 border-black dark:border-white rounded-full px-6 py-2 font-bold uppercase text-sm text-black dark:text-black hover:-translate-y-1 hover:-translate-x-1 transition-transform group-hover:bg-primary">
                  {categoryName}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Venue Section */}
      <Card variant="section" className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-2xl uppercase">장소</h4>
            <span className="material-symbols-outlined text-3xl md:hidden">
              stadium
            </span>
          </div>
          <span className="material-symbols-outlined text-4xl hidden md:block mt-2">
            stadium
          </span>
        </div>
        <div className="md:w-2/3 flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-gray-500">
                장소명
              </span>
              <p className="text-lg font-bold leading-tight">
                {race.venue || "장소 미정"}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-gray-500">
                지역
              </span>
              <p className="text-base font-medium leading-tight">
                {race.region || "지역 미정"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Organizer Section */}
      {race.organizer && (
        <Card variant="section" className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-2xl uppercase">주최</h4>
              <span className="material-symbols-outlined text-3xl md:hidden">
                groups
              </span>
            </div>
            <span className="material-symbols-outlined text-4xl hidden md:block mt-2">
              groups
            </span>
          </div>
          <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1 border-l-4 border-primary pl-4">
              <span className="text-xs font-bold uppercase text-gray-500">
                주최 기관
              </span>
              <p className="text-xl font-bold leading-tight">{race.organizer}</p>
            </div>
            {race.organizerRep && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase text-gray-500">
                  대표자
                </span>
                <p className="text-lg font-bold leading-tight">
                  {race.organizerRep}
                </p>
              </div>
            )}
            {race.region && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase text-gray-500">
                  지역
                </span>
                <p className="text-lg font-bold leading-tight">{race.region}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Contact Section */}
      {(race.phone || race.email) && (
        <Card variant="section" className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-2xl uppercase">문의</h4>
              <span className="material-symbols-outlined text-3xl md:hidden">
                perm_phone_msg
              </span>
            </div>
            <span className="material-symbols-outlined text-4xl hidden md:block mt-2">
              perm_phone_msg
            </span>
          </div>
          <div className="md:w-2/3 flex flex-col md:flex-row gap-6 items-start md:items-center">
            {race.phone && (
              <div className="flex flex-col gap-1 group/link">
                <span className="text-xs font-bold uppercase text-gray-500">
                  전화번호
                </span>
                <a
                  href={`tel:${race.phone}`}
                  className="text-2xl font-black leading-tight hover:text-primary transition-colors decoration-4 underline decoration-black underline-offset-4"
                >
                  {race.phone}
                </a>
              </div>
            )}
            {race.phone && race.email && (
              <div className="hidden md:block w-px h-12 bg-gray-200" />
            )}
            {race.email && (
              <div className="flex flex-col gap-1 group/link">
                <span className="text-xs font-bold uppercase text-gray-500">
                  이메일
                </span>
                <a
                  href={`mailto:${race.email}`}
                  className="text-xl font-bold leading-tight break-all hover:bg-black hover:text-white px-1 -mx-1 transition-colors w-fit"
                >
                  {race.email}
                </a>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
