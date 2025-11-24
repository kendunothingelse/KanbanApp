// src/components/shared/DueDateSelector.tsx
import React from "react";
import DatePicker from "react-datepicker";
import { Button, Box } from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";

interface DueDateSelectorProps {
    selectedDate: Date | null;
    onChange: (date: Date | null) => void;
}

const CustomDatePickerInput = React.forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
        <Button onClick={onClick} ref={ref} size="sm" variant="outline" leftIcon={<CalendarIcon />}>
            {value || "Set Date"}
        </Button>
    )
);

export function DueDateSelector({ selectedDate, onChange }: DueDateSelectorProps) {
    return (
        <Box>
            <DatePicker
                selected={selectedDate}
                onChange={onChange}
                customInput={<CustomDatePickerInput />}
                dateFormat="MMM d, yyyy"
                popperPlacement="bottom-start"
            />
        </Box>
    );
}
