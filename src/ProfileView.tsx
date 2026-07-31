import {
  Badge,
  Button,
  Modal,
  SegmentedControl,
  TextField,
} from "@toss/tds-mobile";
import { Info, UserRound, X } from "lucide-react";
import { useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import {
  AVATAR_CATEGORIES,
  AVATAR_CATEGORY_LABELS,
  AvatarIcon,
  FOOD_STYLES,
  PERSON_STYLES,
  avatarLabel,
  parseAvatarValue,
  toAvatarValue,
  type AvatarCategory,
  type AvatarId,
  type AvatarStyle,
} from "./lib/avatars";
import { resizeImageFile } from "./lib/imageResize";
import { formatTierRange, getLevelInfo, LEVEL_TIERS } from "./lib/levels";
import { saveProfile } from "./lib/profile";

// 브랜드 색(노란색)이 밝아서 흰 글씨는 가독성이 떨어져요. App.tsx의 동명 상수와
// 같은 이유로, variant="fill" 버튼의 글자색을 진하게 덮어써요.
const PRIMARY_FILL_BUTTON_TEXT_STYLE = {
  "--button-color": "#000000",
} as CSSProperties;

const AVATAR_PICKER_BG = "#fff8e6";

// 프로필 이미지 값(사진 데이터 URL 또는 "avatar:person_short_black" 같은 아바타
// 식별자)을 받아서 알맞은 모습(사진/아바타/빈 상태)으로 그려주는 원형 미리보기예요.
// 상단바의 작은 아이콘과 프로필 화면의 큰 미리보기 양쪽에서 함께 써요.
export function ProfileAvatarPreview({
  profileImage,
  size = 64,
}: {
  profileImage: string | null;
  size?: number;
}) {
  const avatar = parseAvatarValue(profileImage);

  if (avatar) {
    return (
      <AvatarIcon
        category={avatar.category}
        style={avatar.style}
        size={size}
        backgroundColor={AVATAR_PICKER_BG}
      />
    );
  }

  if (profileImage) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <img
          src={profileImage}
          alt="프로필 사진"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f2f4f6",
        color: "#8b95a1",
      }}
    >
      <UserRound size={Math.round(size * 0.56)} strokeWidth={1.6} />
    </div>
  );
}

// 상단바(Top의 right 영역)에 놓는 프로필 진입 아이콘이에요. 프로필 이미지가
// 설정되어 있으면 그 모습을, 없으면 빈 사용자 아이콘을 작게 보여줘요.
export function ProfileIconButton({
  profileImage,
  onClick,
}: {
  profileImage: string | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="내 프로필"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        border: "none",
        background: "none",
        padding: 0,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <ProfileAvatarPreview profileImage={profileImage} size={30} />
    </button>
  );
}

// 프로필 사진 바로 아래 놓는 등급 배지예요. "Lv.N · 등급이름 · 다음 등급까지
// N곳 남았어요" 한 줄로 압축해서, 눈에 띄지만 화면을 압도하지 않게 보여줘요.
function LevelBadgeRow({ restaurantCount }: { restaurantCount: number }) {
  const { tier, nextTier, remainingToNext } = getLevelInfo(restaurantCount);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      <Badge size="small" variant="fill" color="yellow">
        Lv.{tier.level}
      </Badge>
      <span style={{ fontSize: "14px", fontWeight: 700, color: "#191f28" }}>
        {tier.name}
      </span>
      <span style={{ fontSize: "13px", color: "#8b95a1" }}>
        {nextTier
          ? `· 다음 등급까지 ${remainingToNext}곳 남았어요`
          : "· 가장 높은 등급이에요"}
      </span>
    </div>
  );
}

// 화면 오른쪽 상단에 놓는 작은 정보 아이콘 버튼이에요. 누르면 전체 등급표 모달이 열려요.
function LevelInfoButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="등급 기준 보기"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        borderRadius: "16px",
        border: "none",
        background: "#f2f4f6",
        padding: 0,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <Info size={17} color="#6b7684" />
    </button>
  );
}

// 전체 등급표 모달이에요. ProfileView가 이미 바텀시트 안에 있어서, 같은 바텀시트
// 훅(useBottomSheet)으로 또 다른 바텀시트를 열면 지금 편집 중인 프로필 화면이
// 통째로 그 내용으로 바뀌어버려요(바텀시트는 한 번에 하나의 내용만 가지는
// 싱글턴이라). 그래서 여기서는 별도의 오버레이인 Modal을 로컬 상태로 직접
// 열고 닫아요.
function LevelTableModal({
  open,
  onClose,
  restaurantCount,
}: {
  open: boolean;
  onClose: () => void;
  restaurantCount: number;
}) {
  const currentLevel = getLevelInfo(restaurantCount).tier.level;

  return (
    <Modal open={open} onOpenChange={(next) => !next && onClose()}>
      <Modal.Overlay onClick={onClose} />
      <Modal.Content
        style={{
          width: "min(86vw, 340px)",
          maxHeight: "76vh",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "17px", fontWeight: 700, color: "#191f28" }}>
            등급표
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={{
              display: "flex",
              border: "none",
              background: "none",
              padding: "4px",
              cursor: "pointer",
              color: "#8b95a1",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {LEVEL_TIERS.map((tier, index) => {
            const isCurrent = tier.level === currentLevel;
            return (
              <div
                key={tier.level}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  backgroundColor: isCurrent ? "#fff4cc" : "transparent",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: isCurrent ? "#9a6b00" : "#8b95a1",
                      flexShrink: 0,
                    }}
                  >
                    Lv.{tier.level}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: isCurrent ? 700 : 400,
                      color: "#191f28",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {tier.name}
                  </span>
                  {isCurrent && (
                    <Badge size="xsmall" variant="fill" color="yellow">
                      현재
                    </Badge>
                  )}
                </div>
                <span
                  style={{ fontSize: "12px", color: "#8b95a1", flexShrink: 0 }}
                >
                  {formatTierRange(tier, index)}
                </span>
              </div>
            );
          })}
        </div>
      </Modal.Content>
    </Modal>
  );
}

// 프로필/설정 화면이에요. 바텀시트 children은 open() 호출 시점에 한 번 고정되기
// 때문에, 사진/아바타/닉네임 편집 상태는 이 컴포넌트 자신이 들고 있다가 "저장하기"를
// 눌러야만 실제로 저장되고 부모(App)에도 반영돼요.
export default function ProfileView({
  userHash,
  nickname,
  profileImage,
  restaurantCount,
  onSaved,
  onClose,
}: {
  userHash: string | null;
  nickname: string;
  profileImage: string | null;
  restaurantCount: number;
  onSaved: (nickname: string, profileImage: string | null) => void;
  onClose: () => void;
}) {
  const [draftNickname, setDraftNickname] = useState(nickname);
  const [draftImage, setDraftImage] = useState<string | null>(profileImage);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [avatarCategory, setAvatarCategory] = useState<AvatarCategory>(
    parseAvatarValue(profileImage)?.category ?? "person",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isTierTableOpen, setIsTierTableOpen] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const canSave =
    draftNickname.trim().length > 0 && Boolean(userHash) && !isSaving;

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 파일을 연달아 선택해도 매번 onChange가 발생하도록 값을 비워둬요.
    event.target.value = "";
    if (!file) {
      return;
    }

    const resized = await resizeImageFile(file, 480, 0.85);
    setDraftImage(resized);
    setIsAvatarPickerOpen(false);
  };

  const handleSelectAvatar = (avatar: AvatarId) => {
    setDraftImage(toAvatarValue(avatar));
  };

  const handleSave = async () => {
    const trimmed = draftNickname.trim();
    if (!trimmed || !userHash) {
      return;
    }

    setIsSaving(true);
    const ok = await saveProfile(userHash, trimmed, draftImage);
    setIsSaving(false);

    if (ok) {
      onSaved(trimmed, draftImage);
      onClose();
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          padding: "0 24px 24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <LevelInfoButton onClick={() => setIsTierTableOpen(true)} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <ProfileAvatarPreview profileImage={draftImage} size={96} />
          <LevelBadgeRow restaurantCount={restaurantCount} />

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />
            <Button
              size="small"
              variant="weak"
              color="dark"
              onClick={() => photoInputRef.current?.click()}
            >
              📷 사진 선택
            </Button>
            <Button
              size="small"
              variant={isAvatarPickerOpen ? "fill" : "weak"}
              color="dark"
              onClick={() => setIsAvatarPickerOpen((prev) => !prev)}
            >
              🙂 아바타 선택
            </Button>
            {draftImage && (
              <Button
                size="small"
                variant="weak"
                color="danger"
                onClick={() => setDraftImage(null)}
              >
                삭제
              </Button>
            )}
          </div>

          {isAvatarPickerOpen && (
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "16px",
                borderRadius: "16px",
                backgroundColor: "#f9fafb",
              }}
            >
              <SegmentedControl
                size="small"
                value={avatarCategory}
                onChange={(value) => setAvatarCategory(value as AvatarCategory)}
              >
                {AVATAR_CATEGORIES.map((category) => (
                  <SegmentedControl.Item key={category} value={category}>
                    {AVATAR_CATEGORY_LABELS[category]}
                  </SegmentedControl.Item>
                ))}
              </SegmentedControl>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "14px",
                  justifyContent: "center",
                }}
              >
                {(
                  (avatarCategory === "person"
                    ? PERSON_STYLES
                    : FOOD_STYLES) as readonly AvatarStyle[]
                ).map((style) => {
                  const avatar: AvatarId = { category: avatarCategory, style };
                  const value = toAvatarValue(avatar);
                  const isSelected = draftImage === value;
                  const label = avatarLabel(avatar);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => handleSelectAvatar(avatar)}
                      aria-label={`${avatarLabel(avatar)} 아바타 선택`}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        width: "68px",
                        background: "none",
                        border: "none",
                        padding: "4px",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          borderRadius: "50%",
                          border: isSelected
                            ? "2.5px solid #FFC107"
                            : "2.5px solid transparent",
                          padding: "2px",
                        }}
                      >
                        <AvatarIcon
                          category={avatarCategory}
                          style={style}
                          size={52}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          color: isSelected ? "#191f28" : "#8b95a1",
                          fontWeight: isSelected ? 700 : 400,
                          textAlign: "center",
                        }}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "14px", color: "#6b7684" }}>닉네임</div>
          <TextField
            variant="box"
            placeholder="닉네임을 입력해주세요"
            value={draftNickname}
            onChange={(e) => setDraftNickname(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            style={{ flex: 1 }}
            variant="weak"
            color="dark"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            style={{ flex: 1, ...PRIMARY_FILL_BUTTON_TEXT_STYLE }}
            variant="fill"
            disabled={!canSave}
            onClick={handleSave}
          >
            저장하기
          </Button>
        </div>
      </div>

      <LevelTableModal
        open={isTierTableOpen}
        onClose={() => setIsTierTableOpen(false)}
        restaurantCount={restaurantCount}
      />
    </>
  );
}
