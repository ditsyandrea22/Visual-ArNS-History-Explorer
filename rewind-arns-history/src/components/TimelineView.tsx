import React from "react";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { ArnsEvent } from "../hooks/useArnsHistory";

interface Props {
  events: ArnsEvent[];
  selectedIdx: number | null;
  onSelect: (idx: number) => void;
}

const eventTypeColors: Record<string, string> = {
  "ownership": "bg-blue-500",
  "record": "bg-green-500",
  "created": "bg-purple-500",
  "other": "bg-gray-400"
};

export default function TimelineView({ events, selectedIdx, onSelect }: Props) {
  return (
    <VerticalTimeline lineColor="#3b82f6">
      {events.map((ev, idx) => (
        <VerticalTimelineElement
          key={ev.txid}
          date={new Date(ev.timestamp * 1000).toLocaleString()}
          iconStyle={{
            background: eventTypeColors[ev.type] || "#94a3b8",
            color: "#fff",
            border: selectedIdx === idx ? "3px solid #2563eb" : undefined
          }}
          icon={
            <span className="font-bold text-lg">
              {ev.type === "ownership" ? "👤" : ev.type === "record" ? "📄" : ev.type === "created" ? "✨" : "🕒"}
            </span>
          }
          className={selectedIdx === idx ? "cursor-pointer shadow-lg scale-105" : "cursor-pointer"}
          onTimelineElementClick={() => onSelect(idx)}
          contentStyle={{
            background: selectedIdx === idx ? "#dbeafe" : "#fff",
            color: "#1e293b",
            boxShadow: selectedIdx === idx ? "0 0 0 2px #2563eb" : undefined
          }}
        >
          <h3 className="font-semibold text-blue-700">
            {ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}
          </h3>
          <p className="text-sm text-gray-600">{ev.summary}</p>
        </VerticalTimelineElement>
      ))}
    </VerticalTimeline>
  );
}