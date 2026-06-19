import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

interface EntitySelectorProps {
  label?: string
  data: any[]
  value: string
  onValueChange: (value: string) => void
  valueKey: string
  labelKey: string
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  isLoading?: boolean
}

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export function EntitySelector({
  label,
  data,
  value,
  onValueChange,
  valueKey,
  labelKey,
  placeholder = "Select an item...",
  searchPlaceholder = "Search...",
  emptyMessage = "No item found.",
  isLoading = false,
}: EntitySelectorProps) {
  const [open, setOpen] = React.useState(false)

  const selectedItem = data?.find((item) => getNestedValue(item, valueKey) === value)
  const selectedLabel = selectedItem ? getNestedValue(selectedItem, labelKey) || getNestedValue(selectedItem, valueKey) : undefined

  return (
    <div className="space-y-2 flex flex-col">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal bg-background"
            disabled={isLoading}
          >
            <span className="truncate text-left flex-1 mr-2">
              {isLoading ? "Loading..." : selectedLabel || <span className="text-muted-foreground">{placeholder}</span>}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {data?.map((item) => {
                  const itemValue = getNestedValue(item, valueKey)
                  const itemLabel = getNestedValue(item, labelKey)
                  return (
                    <CommandItem
                      key={itemValue}
                      value={`${itemLabel} ${itemValue}`}
                      onSelect={() => {
                        onValueChange(itemValue === value ? "" : itemValue)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          value === itemValue ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{itemLabel || itemValue}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
