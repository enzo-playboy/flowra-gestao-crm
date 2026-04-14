export type NotificationPermission = "default" | "granted" | "denied";

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

let notificationPermission: NotificationPermission = "default";

export function getPermission(): NotificationPermission {
  if (!("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
}

export async function requestPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("Este navegador nao suporta notificacoes");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    console.warn("Permissao de notificacao negada");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    notificationPermission = permission;
    return permission === "granted";
  } catch (error) {
    console.error("Erro ao solicitar permissao de notificacao:", error);
    return false;
  }
}

export function sendNotification(options: NotificationOptions): boolean {
  if (!("Notification" in window)) {
    console.warn("Este navegador nao suporta notificacoes");
    return false;
  }

  if (Notification.permission !== "granted") {
    console.warn("Permissao de notificacao nao concedida");
    return false;
  }

  try {
    new Notification(options.title, {
      body: options.body,
      icon: options.icon,
      tag: options.tag,
      requireInteraction: options.requireInteraction ?? false,
    });
    return true;
  } catch (error) {
    console.error("Erro ao enviar notificacao:", error);
    return false;
  }
}

export function scheduleMeetingReminder(meetingTitle: string, meetingDate: string, minutesBefore: number = 15): NodeJS.Timeout | null {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return null;
  }

  const meetingTime = new Date(meetingDate).getTime();
  const reminderTime = meetingTime - minutesBefore * 60 * 1000;
  const now = Date.now();
  const delay = reminderTime - now;

  if (delay <= 0) {
    return null;
  }

  if (delay > 2147483647) {
    console.warn("Lembrete muito distante para ser agendado com setTimeout");
    return null;
  }

  return setTimeout(() => {
    sendNotification({
      title: "Lembrete de Reuniao",
      body: `"${meetingTitle}" comeca em ${minutesBefore} minutos`,
      tag: `meeting-${meetingDate}`,
      requireInteraction: true,
    });
  }, delay);
}

export function scheduleTaskReminder(taskTitle: string, dueDate: string): NodeJS.Timeout | null {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return null;
  }

  const dueTime = new Date(dueDate).getTime();
  const now = Date.now();
  const delay = dueTime - now;

  if (delay <= 0) {
    return null;
  }

  if (delay > 2147483647) {
    return null;
  }

  return setTimeout(() => {
    sendNotification({
      title: "Tarefa Vencendo",
      body: `"${taskTitle}" esta vencendo agora`,
      tag: `task-${dueDate}`,
      requireInteraction: true,
    });
  }, delay);
}

export function checkUpcomingMeetings(meetings: { titulo: string; data_hora: string }[], minutesBefore: number = 15): void {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const now = new Date();
  const threshold = minutesBefore * 60 * 1000;

  meetings.forEach((meeting) => {
    const meetingTime = new Date(meeting.data_hora);
    const diff = meetingTime.getTime() - now.getTime();

    if (diff > 0 && diff <= threshold) {
      sendNotification({
        title: "Reuniao Proxima",
        body: `"${meeting.titulo}" comeca em ${Math.ceil(diff / 60000)} minutos`,
        tag: `meeting-${meeting.data_hora}`,
        requireInteraction: true,
      });
    }
  });
}
