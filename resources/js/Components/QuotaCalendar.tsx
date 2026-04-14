import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { ChevronDownIcon, Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/Components/ui/button"
import { Calendar } from "@/Components/ui/calendar"
import { Field, FieldGroup, FieldLabel } from "@/Components/ui/field"
import { Input } from "@/Components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Components/ui/popover"

export default function DatePickerTime({ 
    date, 
    setDate 
}: { 
    date: string | undefined, 
    setDate: (d: string) => void 
}) {
  const [open, setOpen] = React.useState(false)

  const selectedDate = date ? new Date(date) : undefined;
  const selectedTime = date ? format(new Date(date), "HH:mm:ss") : "10:30:00";

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    
    const [hours, minutes, seconds] = selectedTime.split(':');
    newDate.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
    
    setDate(newDate.toISOString());
    setOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value; // format "HH:mm:ss" or "HH:mm"
    const baseDate = selectedDate || new Date();
    
    const [hours, minutes] = timeValue.split(':');
    const updatedDate = new Date(baseDate);
    updatedDate.setHours(parseInt(hours), parseInt(minutes), 0);
    
    setDate(updatedDate.toISOString());
  };

  return (
    <FieldGroup className="flex-row gap-4">
      <Field className="flex-1">
        <FieldLabel htmlFor="date-picker-optional">Date</FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker-optional"
              className="w-full justify-between font-normal h-11"
            >
              {selectedDate ? format(selectedDate, "PPP") : "Select date"}
              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </Field>

      <Field className="w-32">
        <FieldLabel htmlFor="time-picker-optional">Time</FieldLabel>
        <Input
          type="time"
          id="time-picker-optional"
          step="1"
          value={selectedTime}
          onChange={handleTimeChange}
          className="h-11"
        />
      </Field>
    </FieldGroup>
  )
}