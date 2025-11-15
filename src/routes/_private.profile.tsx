import { ChangePasswordModal } from "@/components/accounts/change-password-modal";
import { DeleteAccountModal } from "@/components/accounts/delete-account-modal";
import { EditPreferencesModal } from "@/components/accounts/edit-preferences-modal";
import { EditProfileModal } from "@/components/accounts/edit-profile-modal";
import { AvatarDisplay } from "@/components/avatar-display";
import Layout from "@/components/layout";
import {
  getAvatarById,
  getBackgroundById,
  getFrameById,
} from "@/constants/prizes";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { Globe, Lock, User } from "lucide-react";

export const Route = createFileRoute("/_private/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: user } = useQuery(convexQuery(api.user.getCurrentUser, {}));

  return (
    <Layout title="Profile">
      <div className="bg-white border-2 border-black rounded-sm p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-300 border-2 border-black rounded-full p-3">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-black">PROFILE</h3>
          </div>

          <EditProfileModal />
        </div>

        <div className="flex flex-col gap-4">
          <AvatarDisplay
            src={getAvatarById(user?.image)?.src}
            bgColor={getBackgroundById(user?.background)?.color}
            frameStyle={getFrameById(user?.frame)?.style}
            size={80}
            className="m-auto"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="block text-sm font-black uppercase tracking-wide">
                Name
              </p>
              <p className="font-black text-xl">{user?.name}</p>
            </div>
            <div>
              <p className="block text-sm font-black uppercase tracking-wide">
                Email
              </p>
              <p className="font-black text-xl">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-black rounded-sm p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-orange-300 border-2 border-black rounded-full p-3">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-black">PREFERENCES</h3>
          </div>

          <EditPreferencesModal />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="block text-sm font-black uppercase tracking-wide">
              Currency
            </p>
            <p className="font-black text-xl">{user?.currency}</p>
          </div>
          <div>
            <p className="block text-sm font-black uppercase tracking-wide">
              Locale
            </p>
            <p className="font-black text-xl">{user?.locale}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-black rounded-sm p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-blue-300 border-2 border-black rounded-full p-3">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-black">SECURITY</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <ChangePasswordModal />

          <DeleteAccountModal />
        </div>
      </div>
    </Layout>
  );
}
