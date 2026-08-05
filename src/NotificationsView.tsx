import { List, ListRow } from "@toss/tds-mobile";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchNotifications,
  markAllNotificationsRead,
  type AppNotification,
} from "./lib/notifications";

function formatNotificationMessage(notification: AppNotification): string {
  return notification.type === "comment"
    ? `${notification.actorNickname}님이 댓글을 남겼어요`
    : `${notification.actorNickname}님이 좋아요를 눌렀어요`;
}

function formatNotificationTime(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isSameDay) {
    return time;
  }

  const dateLabel = date.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });
  return `${dateLabel} ${time}`;
}

// 상단 Top 컴포넌트의 right 영역에 들어가는 알림 아이콘 버튼이에요.
// 읽지 않은 알림이 있으면 오른쪽 위에 빨간 점을 표시해요.
export function NotificationBellButton({
  hasUnread,
  onClick,
}: {
  hasUnread: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="알림"
      style={{
        position: "relative",
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
      <Bell size={22} color="#333d4b" />
      {hasUnread && (
        <span
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            width: "8px",
            height: "8px",
            borderRadius: "4px",
            backgroundColor: "#f04452",
          }}
        />
      )}
    </button>
  );
}

// 알림 목록 바텀시트의 내용이에요. 열리면 목록을 불러오고, 곧바로 전부 읽음 처리해요.
// onRead는 상단 뱃지(빨간 점)를 즉시 지우기 위한 콜백이에요.
export function NotificationsSheetContent({
  userHash,
  onRead,
}: {
  userHash: string | null;
  onRead: () => void;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      if (!userHash) {
        if (isMounted) {
          setIsLoaded(true);
        }
        return;
      }

      const loaded = await fetchNotifications(userHash);
      if (!isMounted) {
        return;
      }
      setNotifications(loaded);
      setIsLoaded(true);

      if (loaded.some((notification) => !notification.isRead)) {
        await markAllNotificationsRead(userHash);
        if (isMounted) {
          onRead();
        }
      }
    })();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userHash]);

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {!isLoaded ? null : notifications.length === 0 ? (
        <div
          style={{
            padding: "40px 0",
            textAlign: "center",
            color: "#8b95a1",
            fontSize: "14px",
          }}
        >
          아직 알림이 없어요.
        </div>
      ) : (
        <List>
          {notifications.map((notification) => (
            <ListRow
              key={notification.id}
              contents={
                <ListRow.Texts
                  type="2RowTypeA"
                  top={formatNotificationMessage(notification)}
                  bottom={formatNotificationTime(notification.createdAt)}
                />
              }
            />
          ))}
        </List>
      )}
    </div>
  );
}
