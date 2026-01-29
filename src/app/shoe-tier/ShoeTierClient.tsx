"use client";

import { useCallback, useRef, useState } from "react";
import { Download, GripVertical, Plus, Trash2, X, ImageIcon } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface ShoeItem {
  id: string;
  name: string;
  imageUrl: string;
}

interface TierRow {
  label: string;
  color: string;
  shoes: ShoeItem[];
}

// ── Tier colours (matching the reference image) ──────────────────────────
const TIER_COLORS: Record<string, string> = {
  SS: "#ff6b6b",
  S: "#ffa46b",
  A: "#ffd36b",
  B: "#6bd9ff",
  C: "#c8ff6b",
  D: "#e0e0e0",
  F: "#a0d8ef",
  STINKY: "#d4d4d4",
};

// ── Admin curated tiers (static sample data) ─────────────────────────────
const ADMIN_TIERS: TierRow[] = [
  {
    label: "SS",
    color: TIER_COLORS.SS,
    shoes: [
      { id: "a1", name: "Nike Alphafly 3", imageUrl: "/shoes/alphafly3.webp" },
      { id: "a2", name: "Adidas Adizero Adios Pro 4", imageUrl: "/shoes/adiospro4.webp" },
    ],
  },
  {
    label: "S",
    color: TIER_COLORS.S,
    shoes: [
      { id: "a3", name: "Nike Vaporfly 3", imageUrl: "/shoes/vaporfly3.webp" },
      { id: "a4", name: "Asics Metaspeed Sky+", imageUrl: "/shoes/metaspeed.webp" },
    ],
  },
  {
    label: "A",
    color: TIER_COLORS.A,
    shoes: [
      { id: "a5", name: "New Balance SC Elite v4", imageUrl: "/shoes/scelite.webp" },
      { id: "a6", name: "Hoka Rocket X2", imageUrl: "/shoes/rocketx2.webp" },
    ],
  },
  {
    label: "B",
    color: TIER_COLORS.B,
    shoes: [
      { id: "a7", name: "Nike Pegasus 41", imageUrl: "/shoes/pegasus41.webp" },
      { id: "a8", name: "Asics Novablast 4", imageUrl: "/shoes/novablast4.webp" },
    ],
  },
  {
    label: "C",
    color: TIER_COLORS.C,
    shoes: [
      { id: "a9", name: "Hoka Clifton 9", imageUrl: "/shoes/clifton9.webp" },
    ],
  },
  { label: "D", color: TIER_COLORS.D, shoes: [] },
  { label: "F", color: TIER_COLORS.F, shoes: [] },
];

// ── Default empty user tiers ─────────────────────────────────────────────
function createEmptyTiers(): TierRow[] {
  return ["SS", "S", "A", "B", "C", "D", "F"].map((label) => ({
    label,
    color: TIER_COLORS[label],
    shoes: [],
  }));
}

// ── Small components ─────────────────────────────────────────────────────
function ShoeCard({ shoe, onRemove }: { shoe: ShoeItem; onRemove?: () => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative group w-16 h-16 md:w-20 md:h-20 border-2 border-border-dark dark:border-white bg-white dark:bg-background-dark rounded-lg overflow-hidden flex-shrink-0 shadow-[var(--shadow-neobrutalism-sm)]">
      {imgError || !shoe.imageUrl ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <span className="text-[10px] font-bold text-center leading-tight px-1 text-gray-500">
            {shoe.name}
          </span>
        </div>
      ) : (
        <img
          src={shoe.imageUrl}
          alt={shoe.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-1 -right-1 size-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

function TierRowView({
  tier,
  editable,
  onDrop,
  onRemoveShoe,
}: {
  tier: TierRow;
  editable?: boolean;
  onDrop?: (tierId: string) => void;
  onRemoveShoe?: (shoeId: string) => void;
}) {
  return (
    <div
      className="flex border-2 border-border-dark dark:border-white"
      onDragOver={editable ? (e) => e.preventDefault() : undefined}
      onDrop={
        editable && onDrop ? () => onDrop(tier.label) : undefined
      }
    >
      {/* Tier label */}
      <div
        className="w-16 md:w-24 flex-shrink-0 flex items-center justify-center font-black text-lg md:text-xl text-border-dark border-r-2 border-border-dark dark:border-white"
        style={{ backgroundColor: tier.color }}
      >
        {tier.label}
      </div>
      {/* Shoes */}
      <div className="flex-1 min-h-[72px] md:min-h-[88px] flex items-center gap-2 p-2 flex-wrap bg-white/50 dark:bg-white/5">
        {tier.shoes.length === 0 && (
          <span className="text-xs text-gray-400 italic pl-2">
            {editable ? "여기에 드래그하세요" : "—"}
          </span>
        )}
        {tier.shoes.map((shoe) => (
          <ShoeCard
            key={shoe.id}
            shoe={shoe}
            onRemove={
              editable && onRemoveShoe
                ? () => onRemoveShoe(shoe.id)
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

// ── Tab button ───────────────────────────────────────────────────────────
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full font-bold text-sm uppercase transition-colors whitespace-nowrap ${
        active
          ? "bg-primary border-2 border-border-dark shadow-sm text-border-dark"
          : "bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
      }`}
    >
      {children}
    </button>
  );
}

// ── Add shoe modal ───────────────────────────────────────────────────────
function AddShoeModal({
  onAdd,
  onClose,
}: {
  onAdd: (shoe: ShoeItem) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      imageUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white dark:bg-background-dark border-4 border-border-dark dark:border-white rounded-xl shadow-[var(--shadow-neobrutalism)] p-6 w-full max-w-md mx-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-black uppercase">운동화 추가</h3>

        <div className="space-y-2">
          <label className="block text-sm font-bold">이름 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: Nike Alphafly 3"
            className="w-full border-2 border-border-dark dark:border-white rounded-lg px-3 py-2 text-sm bg-white dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold">이미지</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="이미지 URL (선택)"
              className="flex-1 border-2 border-border-dark dark:border-white rounded-lg px-3 py-2 text-sm bg-white dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 border-2 border-border-dark dark:border-white rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ImageIcon size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {imageUrl && (
            <div className="w-16 h-16 border-2 border-border-dark rounded-lg overflow-hidden">
              <img src={imageUrl} alt="미리보기" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-primary border-2 border-border-dark rounded-lg font-bold text-sm uppercase shadow-[var(--shadow-neobrutalism-sm)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[var(--shadow-neobrutalism-hover)] transition-all"
          >
            추가
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border-2 border-border-dark dark:border-white rounded-lg font-bold text-sm bg-white dark:bg-background-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────
export function ShoeTierClient() {
  const [tab, setTab] = useState<"admin" | "user">("admin");
  const [userTiers, setUserTiers] = useState<TierRow[]>(createEmptyTiers);
  const [pool, setPool] = useState<ShoeItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dragItem, setDragItem] = useState<ShoeItem | null>(null);
  const tierRef = useRef<HTMLDivElement>(null);

  // ── drag helpers ──
  const handleDragStart = (shoe: ShoeItem) => setDragItem(shoe);

  const handleDropOnTier = useCallback(
    (tierLabel: string) => {
      if (!dragItem) return;
      setUserTiers((prev) =>
        prev.map((t) => {
          // Remove from any tier
          const filtered = t.shoes.filter((s) => s.id !== dragItem.id);
          if (t.label === tierLabel) {
            return { ...t, shoes: [...filtered, dragItem] };
          }
          return { ...t, shoes: filtered };
        })
      );
      setPool((prev) => prev.filter((s) => s.id !== dragItem.id));
      setDragItem(null);
    },
    [dragItem]
  );

  const handleRemoveShoe = useCallback((shoeId: string) => {
    let removed: ShoeItem | undefined;
    setUserTiers((prev) =>
      prev.map((t) => {
        const shoe = t.shoes.find((s) => s.id === shoeId);
        if (shoe) removed = shoe;
        return { ...t, shoes: t.shoes.filter((s) => s.id !== shoeId) };
      })
    );
    if (removed) {
      setPool((prev) => [...prev, removed!]);
    }
  }, []);

  const handleAddShoe = (shoe: ShoeItem) => {
    setPool((prev) => [...prev, shoe]);
  };

  const handleDropOnPool = useCallback(() => {
    if (!dragItem) return;
    setUserTiers((prev) =>
      prev.map((t) => ({
        ...t,
        shoes: t.shoes.filter((s) => s.id !== dragItem.id),
      }))
    );
    setPool((prev) => {
      if (prev.some((s) => s.id === dragItem.id)) return prev;
      return [...prev, dragItem];
    });
    setDragItem(null);
  }, [dragItem]);

  // ── download as image ──
  const handleDownload = async () => {
    const el = tierRef.current;
    if (!el) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(el, {
        backgroundColor: "#f8f8f5",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = "my-shoe-tier.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("이미지 다운로드에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleReset = () => {
    const allShoes = userTiers.flatMap((t) => t.shoes);
    setPool((prev) => [...prev, ...allShoes]);
    setUserTiers(createEmptyTiers());
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-3">
        <TabButton active={tab === "admin"} onClick={() => setTab("admin")}>
          에디터 추천
        </TabButton>
        <TabButton active={tab === "user"} onClick={() => setTab("user")}>
          나만의 티어
        </TabButton>
      </div>

      {/* ── Admin Tab ─────────────────────────────────────────────────── */}
      {tab === "admin" && (
        <div className="bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-xl shadow-[var(--shadow-neobrutalism)] overflow-hidden">
          <div className="p-4 border-b-2 border-border-dark dark:border-white bg-primary/20">
            <h2 className="font-black text-lg uppercase">에디터 선정 러닝화 티어</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              매달 에디터가 선정한 러닝화 등급표입니다.
            </p>
          </div>
          <div className="divide-y-0">
            {ADMIN_TIERS.map((tier) => (
              <TierRowView key={tier.label} tier={tier} />
            ))}
          </div>
        </div>
      )}

      {/* ── User Tab ──────────────────────────────────────────────────── */}
      {tab === "user" && (
        <div className="space-y-6">
          {/* Actions bar */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary border-2 border-border-dark rounded-lg font-bold text-sm shadow-[var(--shadow-neobrutalism-sm)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[var(--shadow-neobrutalism-hover)] transition-all"
            >
              <Plus size={16} />
              운동화 추가
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-lg font-bold text-sm shadow-[var(--shadow-neobrutalism-sm)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[var(--shadow-neobrutalism-hover)] transition-all"
            >
              <Download size={16} />
              이미지 저장
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-lg font-bold text-sm shadow-[var(--shadow-neobrutalism-sm)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[var(--shadow-neobrutalism-hover)] transition-all text-red-500"
            >
              <Trash2 size={16} />
              초기화
            </button>
          </div>

          {/* Tier table */}
          <div
            ref={tierRef}
            className="bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-xl shadow-[var(--shadow-neobrutalism)] overflow-hidden"
          >
            <div className="p-4 border-b-2 border-border-dark dark:border-white bg-primary/20">
              <h2 className="font-black text-lg uppercase">나만의 운동화 티어</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                운동화를 추가하고 드래그하여 티어를 배치하세요.
              </p>
            </div>
            <div>
              {userTiers.map((tier) => (
                <TierRowView
                  key={tier.label}
                  tier={tier}
                  editable
                  onDrop={handleDropOnTier}
                  onRemoveShoe={handleRemoveShoe}
                />
              ))}
            </div>
          </div>

          {/* Shoe pool */}
          <div
            className="bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-xl shadow-[var(--shadow-neobrutalism)] p-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropOnPool}
          >
            <h3 className="font-bold text-sm uppercase mb-3 text-gray-500">
              미배치 운동화 (드래그하여 티어에 배치)
            </h3>
            <div className="flex flex-wrap gap-2 min-h-[80px]">
              {pool.length === 0 && (
                <span className="text-xs text-gray-400 italic">
                  &quot;운동화 추가&quot; 버튼을 눌러 시작하세요.
                </span>
              )}
              {pool.map((shoe) => (
                <div
                  key={shoe.id}
                  draggable
                  onDragStart={() => handleDragStart(shoe)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <ShoeCard shoe={shoe} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAddModal && (
        <AddShoeModal
          onAdd={handleAddShoe}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
