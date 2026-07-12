import React from "react";
import { Calendar } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="bg-black min-h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold m-0">Events</h1>
      </div>

      <div className="bg-[#080808] rounded-[15px] flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center mb-4">
          <Calendar size={24} className="text-[var(--color-accent)]" />
        </div>
        <h2 className="text-[18px] font-bold m-0">No events yet</h2>
        <p className="text-[13px] text-[#9b9b9b] mt-2 mb-0 max-w-[360px]">
          Concerts and live events for your favorite artists will show up here in a future update.
        </p>
      </div>
    </div>
  );
}
