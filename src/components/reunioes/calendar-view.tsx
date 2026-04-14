"use client";

import { useEffect, useState } from "react";
import { getReunioes } from "@/lib/supabase/queries";
import { updateReuniao } from "@/lib/supabase/mutations";
import type { Reuniao } from "@/types/database";
import { getStatusColor } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const monthNames = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

interface CalendarViewProps {
  onMeetingClick?: (meeting: Reuniao) => void;
}

export function CalendarView({ onMeetingClick }: CalendarViewProps) {
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{ year: number; month: number; day: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const data = await getReunioes();
      setReunioes(data);
    } catch (error) {
      console.error("Erro ao carregar reunioes:", error);
    } finally {
      setLoading(false);
    }
  }

  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }

  function getMeetingsForDay(year: number, month: number, day: number) {
    return reunioes.filter((r) => {
      const date = new Date(r.data_hora);
      return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      );
    });
  }

  function prevMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const meetingId = active.id as string;
    const targetDay = over.id as string;

    if (!targetDay.startsWith("day-")) return;

    const parts = targetDay.replace("day-", "").split("-");
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);

    const meeting = reunioes.find((r) => r.id === meetingId);
    if (!meeting) return;

    const oldDate = new Date(meeting.data_hora);
    const newDate = new Date(year, month, day, oldDate.getHours(), oldDate.getMinutes());

    updateReuniao(meetingId, { data_hora: newDate.toISOString() }).then((result) => {
      if (result) {
        setReunioes((prev) => prev.map((r) => (r.id === meetingId ? result : r)));
      }
    });
  }

  if (loading) {
    return <p className="text-muted">Carregando calendario...</p>;
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">
          {monthNames[month]} {year}
        </h2>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-7 gap-1">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-xs text-muted py-2 font-medium">
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            const dayKey = day ? `day-${year}-${month}-${day}` : `empty-${index}`;
  const isToday = Boolean(
      day &&
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );

            return (
              <CalendarDayCell
                key={dayKey}
                id={dayKey}
                day={day}
                isToday={isToday}
                meetings={day ? getMeetingsForDay(year, month, day) : []}
                onMeetingClick={onMeetingClick}
                onSelectDay={day ? () => setSelectedDay({ year, month, day }) : undefined}
              />
            );
          })}
        </div>
      </DndContext>

      {selectedDay && (
        <DayMeetingsModal
          day={selectedDay}
          meetings={getMeetingsForDay(selectedDay.year, selectedDay.month, selectedDay.day)}
          onClose={() => setSelectedDay(null)}
          onMeetingClick={onMeetingClick}
        />
      )}
    </div>
  );
}

function CalendarDayCell({
  id,
  day,
  isToday,
  meetings,
  onMeetingClick,
  onSelectDay,
}: {
  id: string;
  day: number | null;
  isToday: boolean;
  meetings: Reuniao[];
  onMeetingClick?: (meeting: Reuniao) => void;
  onSelectDay?: () => void;
}) {
  const { setNodeRef } = useDroppable({ id });

  if (!day) {
    return <div className="h-24 bg-card/30 rounded-lg" />;
  }

  return (
    <div
      ref={setNodeRef}
      onClick={onSelectDay}
      className={`h-24 bg-card border border-border rounded-lg p-1.5 cursor-pointer hover:border-accent/30 transition-colors ${
        isToday ? "border-accent bg-accent/5" : ""
      }`}
    >
      <div className={`text-xs font-medium mb-1 ${isToday ? "text-accent" : "text-muted"}`}>
        {day}
      </div>
      <div className="space-y-0.5 overflow-hidden">
        {meetings.slice(0, 2).map((meeting) => (
          <MeetingChip key={meeting.id} meeting={meeting} onClick={onMeetingClick} />
        ))}
        {meetings.length > 2 && (
          <div className="text-[10px] text-muted">+{meetings.length - 2} mais</div>
        )}
      </div>
    </div>
  );
}

function MeetingChip({ meeting, onClick }: { meeting: Reuniao; onClick?: (meeting: Reuniao) => void }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: meeting.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(meeting);
      }}
      className={`px-1.5 py-0.5 rounded text-[10px] truncate ${getStatusColor(meeting.status)} cursor-grab active:cursor-grabbing`}
    >
      {meeting.titulo}
    </div>
  );
}

function DayMeetingsModal({
  day,
  meetings,
  onClose,
  onMeetingClick,
}: {
  day: { year: number; month: number; day: number };
  meetings: Reuniao[];
  onClose: () => void;
  onMeetingClick?: (meeting: Reuniao) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {day.day} de {monthNames[day.month]} de {day.year}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
            <CalendarIcon className="w-4 h-4" />
          </button>
        </div>
        {meetings.length === 0 ? (
          <p className="text-muted text-center py-4">Nenhuma reuniao neste dia</p>
        ) : (
          <div className="space-y-2">
            {meetings.map((meeting) => (
              <button
                key={meeting.id}
                onClick={() => {
                  onMeetingClick?.(meeting);
                  onClose();
                }}
                className="w-full text-left p-3 bg-background border border-border rounded-lg hover:border-accent/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{meeting.titulo}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(meeting.status)}`}>
                    {meeting.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-muted mt-1">
                  {new Date(meeting.data_hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
