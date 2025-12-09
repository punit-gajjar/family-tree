import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Command } from "cmdk"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "../../lib/utils"

export interface ComboboxOption {
    value: string
    label: string
}

interface ComboboxProps {
    options: ComboboxOption[]
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    emptyText?: string
    className?: string
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = "Select...",
    emptyText = "No results found.",
    className,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    // cmdk requires a wrapper with styles, we'll inline simple styles or rely on tailwind
    return (
        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
            <PopoverPrimitive.Trigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "flex h-9 w-full items-center justify-between rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300",
                        className
                    )}
                >
                    {value
                        ? options.find((option) => option.value === value)?.label
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content className="z-50 w-[200px] p-0" align="start">
                    <div className="w-[var(--radix-popover-trigger-width)] min-w-[200px] overflow-hidden rounded-md border border-slate-200 bg-white text-slate-950 shadow-md transform transition-all dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50">
                        <Command className="flex h-full w-full flex-col overflow-hidden rounded-md bg-white dark:bg-slate-950">
                            <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                                <Command.Input
                                    placeholder={`Search ${placeholder.toLowerCase()}...`}
                                    className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-slate-400"
                                />
                            </div>
                            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden py-2" style={{ scrollbarWidth: 'thin' }}>
                                <Command.Empty className="py-6 text-center text-sm text-slate-500">
                                    {emptyText}
                                </Command.Empty>
                                {options.map((option) => (
                                    <Command.Item
                                        key={option.value}
                                        value={option.label} // Search by label
                                        onSelect={() => {
                                            onChange(option.value === value ? "" : option.value)
                                            setOpen(false)
                                        }}
                                        className={cn(
                                            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-slate-100 aria-selected:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:aria-selected:bg-slate-800 dark:aria-selected:text-slate-50",
                                            value === option.value ? "bg-slate-100 dark:bg-slate-800" : ""
                                        )}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option.label}
                                    </Command.Item>
                                ))}
                            </Command.List>
                        </Command>
                    </div>
                </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
    )
}
