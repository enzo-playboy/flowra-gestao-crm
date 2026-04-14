"use client";

import { useEffect, useRef, useCallback } from "react";
import { requestPermission, scheduleMeetingReminder, checkUpcomingMeetings } from "@/lib/notifications";

interface UseNotificationsOptions {
  autoCheck?: boolean;
  checkInterval?: number;
  minutesBefore?: number;
}

export function useNotifications(
  meetings: { titulo: string; data_hora: string }[] = [],
  options: UseNotificationsOptions = {}
) {
  const { autoCheck = true, checkInterval = 60000, minutesBefore = 15 } = options;
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const requestPermissionAndNotify = useCallback(async () => {
    const granted = await requestPermission();
    return granted;
  }, []);

  const scheduleReminders = useCallback(
    (meetingsList: { titulo: string; data_hora: string }[]) => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current = [];

      if (Notification.permission !== "granted") return;

      meetingsList.forEach((meeting) => {
        const timer = scheduleMeetingReminder(meeting.titulo, meeting.data_hora, minutesBefore);
        if (timer) {
          timersRef.current.push(timer);
        }
      });
    },
    [minutesBefore]
  );

  useEffect(() => {
    scheduleReminders(meetings);

    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [meetings, scheduleReminders]);

  useEffect(() => {
    if (autoCheck && Notification.permission === "granted") {
      intervalRef.current = setInterval(() => {
        checkUpcomingMeetings(meetings, minutesBefore);
      }, checkInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [meetings, autoCheck, checkInterval, minutesBefore]);

  return { requestPermissionAndNotify };
}
