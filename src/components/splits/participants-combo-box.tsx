"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";

type ParticipantT = FunctionReturnType<
  typeof api.splits.searchAvailableParticipants
>[0];

export interface ParticipantComboboxProps {
  onParticipantSelect: (participant: ParticipantT) => void;
  value?: string;
}

export function ParticipantCombobox({
  onParticipantSelect,
  value,
}: ParticipantComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [popoverWidth, setPopoverWidth] = React.useState<string>("auto");

  React.useLayoutEffect(() => {
    const updateWidth = () => {
      if (triggerRef.current) {
        setPopoverWidth(`${triggerRef.current.offsetWidth}px`);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    if (triggerRef.current) {
      resizeObserver.observe(triggerRef.current);
    }

    return () => {
      if (triggerRef.current) {
        resizeObserver.unobserve(triggerRef.current);
      }
    };
  }, [open]);

  const [inputValue, setInputValue] = React.useState(value || "");
  const debouncedSearchTerm = useDebounce(inputValue, 500);

  const { data, isLoading } = useQuery(
    convexQuery(api.splits.searchAvailableParticipants, {
      name: debouncedSearchTerm,
    })
  );

  const id = React.useId();

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="w-full" asChild>
          <Button
            type="button"
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            id={id}
          >
            Add Participant
          </Button>
        </PopoverTrigger>
        <PopoverContent style={{ width: popoverWidth }} className="p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search using name of Participant..."
              //   value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              {isLoading ? (
                <CommandItem disabled className="p-2 text-center text-sm">
                  Loading...
                </CommandItem>
              ) : (
                <>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {data?.map((user) => (
                      <CommandItem
                        key={user?.userId}
                        value={user?.userId}
                        onSelect={(currentValue) => {
                          const participant = data?.find(
                            (item) => item.userId === currentValue
                          );

                          if (participant) {
                            onParticipantSelect(participant);
                          }
                          setOpen(false);
                          setInputValue(currentValue);
                        }}
                        className="font-medium"
                      >
                        {user.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
