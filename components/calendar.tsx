"use client"

import { useState } from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface CalendarProps {
  projects: any[]
}

export function Calendar({ projects }: CalendarProps) {
  const [date, setDate] = useState<Date>()

  // Projelerin tarihlerini işaretle
  const markedDates = projects.map((project) => ({
    date: new Date(project.dueDate),
    project: project.name,
  }))

  return (
    <div className="p-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: tr }) : "Tarih seçin"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            locale={tr}
            modifiers={{
              marked: markedDates.map((d) => d.date),
            }}
            modifiersStyles={{
              marked: {
                backgroundColor: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
                borderRadius: "50%",
              },
            }}
          />
        </PopoverContent>
      </Popover>

      {date && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">
            {format(date, "d MMMM yyyy", { locale: tr })} tarihindeki projeler:
          </h3>
          <ul className="space-y-2">
            {markedDates
              .filter((d) => format(d.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))
              .map((d, i) => (
                <li key={i} className="text-sm">
                  {d.project}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
} 