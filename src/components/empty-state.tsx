import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";
import { Button } from "./ui/button";
import { Coins } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  btnLabel?: string;
  onBtnClick?: () => void;
}

export function EmptyState({
  title = "No data",
  description = "No data found",
  btnLabel = "Add data",
  onBtnClick,
}: EmptyStateProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Coins />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription className="text-black">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {onBtnClick && (
          <Button
            onClick={() => {
              onBtnClick?.();
            }}
            className="border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
          >
            {btnLabel}
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
