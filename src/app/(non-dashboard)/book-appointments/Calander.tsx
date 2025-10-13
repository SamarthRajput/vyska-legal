"use client";

import React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

interface MarkedCalendarProps {
    markedDates?: (string | Date)[]; // Dates to highlight
    onSelect?: (date: Date | undefined) => void;
    selected?: Date | undefined;
    color?: string; // Optional: custom color for marked dates
}

const MarkedCalendar: React.FC<MarkedCalendarProps> = ({
    markedDates = [],
    onSelect,
    selected,
    color = "#2563eb", // default Tailwind blue-600
}) => {
    // Convert markedDates to a Set of YYYY-MM-DD for easy matching
    const markedSet = new Set(
        markedDates.map((d) =>
            typeof d === "string" ? d : d.toISOString().split("T")[0]
        )
    );

    return (
        <div className="relative w-fit rounded-lg border bg-white p-3 shadow-sm">
            <DayPicker
                mode="single"
                selected={selected}
                onSelect={onSelect}
                showOutsideDays
                classNames={{
                    day: "relative text-sm p-1 w-9 h-9 rounded-md hover:bg-gray-100",
                    selected: "bg-blue-600 text-white",
                }}
                components={{
                    Day: (props) => {
                        const { day } = props;
                        if (!day) return <div>No date selected</div>;
                        // Cast day to Date to satisfy TypeScript
                        const dateKey = (day as unknown as Date)
                            .toISOString().split("T")[0];
                        const isMarked = markedSet.has(typeof dateKey === "string" ? dateKey : dateKey.toISOString().split("T")[0]
                        );
                        const base = props.className ?? "";

                        return (
                            <div
                                {...props}
                                className={`${base} relative flex items-center justify-center`}
                            >
                                {(day instanceof Date) ? day.getDate() : null}
                                {isMarked && (
                                    <span
                                        className="absolute bottom-[3px] w-[5px] h-[5px] rounded-full"
                                        style={{ backgroundColor: color }}
                                    ></span>
                                )}
                            </div>
                        );
                    },
                }}
            />
        </div>
    );
    <style jsx>{`
        .my-marked-day {
  background-color: #fde68a; /* example */
}

.dot-indicator {
  width: 6px;
  height: 6px;
  background: red;
  border-radius: 50%;
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
}
`}</style>
};

export default MarkedCalendar;