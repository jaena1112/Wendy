//Supabase Realtime 구독 (실시간 이벤트 반영)
import { supabase } from "./config.js";

/**
 * 현재 그룹의 events 및 members 테이블의 변경 사항을 실시간 감지합니다.
 * @param {string} groupId - 현재 속한 그룹의 UUID
 * @param {Function} onEventsChange - 일정 데이터가 변경되었을 때 실행할 콜백 함수
 * @param {Function} onMembersChange - 멤버 목록이 변경되었을 때 실행할 콜백 함수
 */
export function subscribeGroupChanges(
  groupId,
  onEventsChange,
  onMembersChange,
) {
  const channel = supabase
    .channel(`group-${groupId}`)

    // 1. events 테이블 변경 감지 (추가/수정/삭제)
    .on(
      "postgres_changes",
      {
        event: "*", // INSERT, UPDATE, DELETE 모두 감지
        schema: "public",
        table: "events",
        filter: `group_id=eq.${groupId}`,
      },
      (payload) => {
        console.log("실시간 일정 변경 감지:", payload);
        if (onEventsChange) onEventsChange(payload);
      },
    )

    // 2. members 테이블 변경 감지 (새 그룹원 가입 / 색상 변경 등)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "members",
        filter: `group_id=eq.${groupId}`,
      },
      (payload) => {
        console.log("실시간 멤버 변경 감지:", payload);
        if (onMembersChange) onMembersChange(payload);
      },
    )
    .subscribe();

  // 구독 해제 함수 반환
  return () => {
    supabase.removeChannel(channel);
  };
}
