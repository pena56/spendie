import { TransactionCategories } from "@/constants/categories";
import { formatDate } from "@/lib/utils";
import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { AmountDisplay } from "../amount-display";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { SettleSplitModal } from "./settle-split-modal";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { getAvatarById, getBackgroundById } from "@/constants/prizes";

interface SplitCardProps {
  data?: FunctionReturnType<typeof api.splits.getUserSplits>["splits"][0];
}

export function SplitCard({ data }: SplitCardProps) {
  const { data: user } = useQuery(convexQuery(api.user.getCurrentUser, {}));

  if (!data) return null;

  const category = TransactionCategories.find(
    (item) => item.name === data?.category
  );

  return (
    <Collapsible className="bg-white border-2 border-black rounded-sm p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex flex-col md:flex-row justify-between">
        <div className="flex gap-4">
          <div
            className={`${category?.color} w-10 h-10 flex items-center justify-center rounded-sm border-2 border-black`}
          >
            {category && <category.icon />}
          </div>

          <div className="leading-none">
            <p className="font-black text-lg">{data?.description}</p>
            <p className="font-semibold">Due: {formatDate(data?.date)}</p>

            <div className="flex -space-x-2 mt-2">
              {data?.participants?.map((item) => (
                <Avatar
                  key={item.id}
                  style={{
                    backgroundColor: getBackgroundById(item?.background)?.color,
                  }}
                  className="font-black border-2 border-black  shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  <AvatarImage
                    style={{
                      backgroundColor: getBackgroundById(item?.background)
                        ?.color,
                    }}
                    src={getAvatarById(item.image)?.src || ""}
                    alt={item?.name}
                  />
                  <AvatarFallback
                    style={{
                      backgroundColor: getBackgroundById(item?.background)
                        ?.color,
                      color: getBackgroundById(item?.background)?.textColor,
                    }}
                    className="uppercase"
                  >
                    {item?.name?.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {data?.remainingAmount > 0 && (
            <div className="text-right leading-none">
              <p className="text-sm font-black uppercase tracking-wide">
                Your Share
              </p>
              <p className="text-xl font-black text-red-600">
                <AmountDisplay amount={data.remainingAmount} />
              </p>
              <p className="text-sm font-black text-black">
                of <AmountDisplay amount={data.totalAmount} />
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-2 items-center">
            {data?.remainingAmount === 0 ? (
              <span className="inline-block bg-green-200 border-2 border-black rounded-sm px-4 py-2 font-black text-sm">
                SETTLED ✓
              </span>
            ) : (
              <SettleSplitModal
                amountLeft={data.remainingAmount}
                splitId={data.id}
              />
            )}

            {/* {data?.isOwner && !data?.isSettled && (
              <div className="flex space-x-2">
                <Button className="bg-white w-8 h-8 border-2 border-black rounded-sm hover:bg-gray-50 transition-colors">
                  <Edit2 className="w-5 h-5 text-black" />
                </Button>

                <Button
                  variant={"destructive"}
                  className="w-8 h-8 border-2 border-black rounded-sm  transition-colors"
                >
                  <Trash className="w-5 h-5 text-black" />
                </Button>
              </div>
            )} */}
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="size-10 text-black">
              <ChevronsUpDown />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent className="flex flex-col gap-2 pt-4">
        <Separator />
        <h4 className="text-sm font-bold tracking-wider ">
          PARTICIPANTS PROGRESS
        </h4>

        {data?.participants?.map((item) => (
          <div key={item?.id} className="leading-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="font-bold">
                  {item?.name} {user?._id === item?.id && "(You)"}
                </p>
              </div>

              <p className="text-xs font-bold">
                <AmountDisplay amount={item?.contributed} /> /{" "}
                <AmountDisplay amount={item?.expected} />
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Progress
                value={Number(item?.progress) || 0}
                indicatorClassName={
                  Number(item?.progress) < 100 ? "bg-red-400" : "bg-green-400"
                }
              />

              <p className="text-sm font-black">{item?.progress}%</p>
            </div>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
