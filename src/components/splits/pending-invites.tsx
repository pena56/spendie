import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CircleDollarSign, UsersRound, X } from "lucide-react";
import { FunctionReturnType } from "convex/server";
import { api } from "convex/_generated/api";
import { AmountDisplay } from "../amount-display";
import { useMutation } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";
import { showErrorMessage } from "@/lib/utils";

type Invites = FunctionReturnType<
  typeof api.splits.getUserSplits
>["pendingInvites"];

interface PendingInvitesProps {
  invites?: Invites;
}

export function PendingInvites({ invites }: PendingInvitesProps) {
  const { mutate, isPending } = useMutation({
    mutationFn: useConvexMutation(api.splits.respondToSplitInvite),
    onError: (err) => {
      showErrorMessage(err);
    },
  });

  if (!invites || invites?.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Pending Invites</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {invites?.map((invite) => (
          <Card
            key={invite?.id}
            className="border-2 border-black rounded-sm p-4 bg-cyan-500"
          >
            <div>
              <h3 className="text-lg font-bold">{invite?.message}</h3>
              <p className="text-sm text-black">
                Invited by{" "}
                <span className="font-bold">{invite?.invitedBy}</span>
              </p>

              <div className="bg-white border-3 border-black rounded-sm p-2 mb-1">
                <p className="text-xs font-bold text-gray-700 mb-1">
                  YOUR SHARE
                </p>
                <p className="text-2xl font-bold text-green-600">
                  <AmountDisplay amount={invite?.expectedSettlement} />
                </p>
              </div>

              <div className="flex gap-4 text-sm leading-none">
                <div className="flex items-center gap-2">
                  <UsersRound size={20} />

                  <p className="font-semibold">
                    {invite?.numberOfParticipants} participants
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <CircleDollarSign size={20} />

                  <p className="font-semibold">
                    <AmountDisplay amount={invite?.totalAmount} />
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  if (invite?.id) {
                    mutate({ action: "accept", inviteId: invite?.id });
                  }
                }}
                isLoading={isPending}
                className="flex-1 bg-green-400 text-black font-bold border-2 border-black hover:bg-green-500 rounded-sm"
              >
                <Check size={18} />
                Accept
              </Button>
              <Button
                onClick={() => {
                  if (invite?.id) {
                    mutate({ action: "reject", inviteId: invite?.id });
                  }
                }}
                isLoading={isPending}
                className="flex-1 bg-red-400 text-black font-bold border-2 border-black hover:bg-red-500 rounded-sm"
              >
                <X size={18} />
                Reject
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
