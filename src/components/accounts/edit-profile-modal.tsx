import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { showErrorMessage } from "@/lib/utils";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";
import {
  AVATARS,
  BACKGROUND,
  DEFAULT_PERKS,
  FRAMES,
  getAvatarById,
  getBackgroundById,
  getFrameById,
} from "@/constants/prizes";
import { Check, Lock } from "lucide-react";
import { AvatarDisplay } from "../avatar-display";

export const formatTimestampForInput = (timestamp: number) => {
  return new Date(timestamp).toISOString().split("T")[0];
};

export const formSchema = z.object({
  name: z.string().min(1, "Name is always required"),
  image: z.string(),
  background: z.string(),
  frame: z.string(),
});

export type FormValues = z.infer<typeof formSchema>;

export function EditProfileModal() {
  const { data: user } = useQuery(convexQuery(api.user.getCurrentUser, {}));

  const { mutate, isPending } = useMutation({
    mutationFn: useConvexMutation(api.user.updateUserInfo),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setOpen(false);
    },
    onError: (err) => {
      showErrorMessage(err);
    },
  });

  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: user?.name || "",
      image: user?.image || "",
      background: user?.background || "",
      frame: user?.frame || "",
    } satisfies FormValues,
    onSubmit: async ({ value }) => {
      mutate(value);
    },
    validators: {
      onChange: formSchema,
    },
  });

  if (!user) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-yellow-300 text-black hover:bg-yellow-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 font-semibold">
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] border-2 border-black rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              Customize Your Profile
            </DialogTitle>
            <DialogDescription className="text-center text-black font-medium text-base">
              Make changes to your profile
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <div className=" flex items-center gap-4">
              <form.Subscribe
                selector={(state) => ({
                  image: state.values.image,
                  frame: state.values.frame,
                  background: state.values.background,
                })}
                children={({ image, frame, background }) => {
                  const selectedAvatar = AVATARS?.find(
                    (item) => item.id === image
                  );
                  const frameStyle = getFrameById(frame)?.style;
                  const bgColor = getBackgroundById(background)?.color;

                  return (
                    <AvatarDisplay
                      bgColor={bgColor}
                      className="ml-auto"
                      frameStyle={frameStyle}
                      src={selectedAvatar?.src}
                    />
                  );
                }}
              />

              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field
                      className="leading-none gap-0"
                      data-invalid={isInvalid}
                    >
                      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        type="text"
                        placeholder="Your name"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            </div>

            <Tabs defaultValue={"avatar"}>
              <TabsList className="w-full">
                <TabsTrigger
                  value="avatar"
                  className="data-[state=active]:bg-yellow-300 data-[state=active]:border-black data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] data-[state=active]:-translate-x-0.5 data-[state=active]:-translate-y-0.5 data-[state=active]:font-bold"
                >
                  Avatar
                </TabsTrigger>
                <TabsTrigger
                  value="frame"
                  className="data-[state=active]:bg-yellow-300 data-[state=active]:border-black data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] data-[state=active]:-translate-x-0.5 data-[state=active]:-translate-y-0.5 data-[state=active]:font-bold"
                >
                  Frame
                </TabsTrigger>
                <TabsTrigger
                  value="background"
                  className="data-[state=active]:bg-yellow-300 data-[state=active]:border-black data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] data-[state=active]:-translate-x-0.5 data-[state=active]:-translate-y-0.5 data-[state=active]:font-bold"
                >
                  Background
                </TabsTrigger>
              </TabsList>

              <TabsContent value="avatar">
                <div className="grid grid-cols-3 gap-4">
                  {/* Default Avatar */}
                  <form.Subscribe
                    selector={(state) => state.values.image}
                    children={(selectedImageId) => {
                      const selectedAvatar = AVATARS?.find(
                        (item) => item.id === selectedImageId
                      );

                      return (
                        <Button
                          type="button"
                          onClick={() => {
                            form.setFieldValue(
                              "image",
                              DEFAULT_PERKS.avatar.id
                            );
                          }}
                          className={`w-20 m-auto h-20 bg-white hover:bg-gray-100 p-0 rounded-full flex items-center justify-center border-4 relative ${
                            selectedAvatar?.id === DEFAULT_PERKS.avatar.id
                              ? "border-green-300"
                              : "border-yellow-300"
                          }`}
                        >
                          <img
                            src={getAvatarById(DEFAULT_PERKS.avatar.id)?.src}
                            className="w-full h-full object-contain"
                            alt=""
                          />

                          {selectedAvatar?.id === DEFAULT_PERKS.avatar.id && (
                            <div className="w-6 h-6 rounded-full absolute right-0 bottom-0 bg-green-400 flex items-center justify-center text-white">
                              <Check size={14} />
                            </div>
                          )}
                        </Button>
                      );
                    }}
                  />

                  {user?.availableAvatars?.map((item) => (
                    <form.Subscribe
                      key={item.id}
                      selector={(state) => state.values.image}
                      children={(selectedImageId) => {
                        const selectedAvatar = AVATARS?.find(
                          (item) => item.id === selectedImageId
                        );

                        return (
                          <Button
                            type="button"
                            disabled={!item.isUnlocked}
                            onClick={() => {
                              if (item.isUnlocked) {
                                form.setFieldValue("image", item.id);
                              }
                            }}
                            className={`w-20 m-auto h-20 bg-white hover:bg-gray-100 p-0 rounded-full flex items-center justify-center border-4 relative ${
                              !item.isUnlocked
                                ? "border-gray-500"
                                : selectedAvatar?.id === item.id
                                ? "border-green-300"
                                : "border-yellow-300"
                            }`}
                          >
                            <img
                              src={getAvatarById(item.id)?.src}
                              className="w-full h-full object-contain"
                              alt=""
                            />

                            {selectedAvatar?.id === item.id &&
                              item.isUnlocked && (
                                <div className="w-6 h-6 rounded-full absolute right-0 bottom-0 bg-green-400 flex items-center justify-center text-white">
                                  <Check size={14} />
                                </div>
                              )}

                            {!item.isUnlocked && (
                              <div className="w-6 h-6 rounded-full absolute right-0 bottom-0 bg-green-400 flex items-center justify-center text-white">
                                <Lock size={14} />
                              </div>
                            )}
                          </Button>
                        );
                      }}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="frame">
                <div className="grid grid-cols-3 gap-4">
                  {/* Default Frame */}
                  <form.Subscribe
                    selector={(state) => state.values.frame}
                    children={(selectedFrameId) => {
                      const selectedFrame = FRAMES?.find(
                        (item) => item.id === selectedFrameId
                      );

                      return (
                        <Button
                          type="button"
                          onClick={() => {
                            form.setFieldValue("frame", DEFAULT_PERKS.frame.id);
                          }}
                          className={`w-16 h-16 flex items-center justify-center relative border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 m-auto`}
                          style={{
                            ...getFrameById(DEFAULT_PERKS.frame.id)?.style,
                            backgroundColor: user.background,
                          }}
                        >
                          {selectedFrame?.id === DEFAULT_PERKS.frame.id && (
                            <div className="w-6 h-6 rounded-full absolute right-0 bottom-0 bg-green-400 flex items-center justify-center text-white">
                              <Check size={14} />
                            </div>
                          )}
                        </Button>
                      );
                    }}
                  />

                  {user?.availableFrames?.map((item) => (
                    <form.Subscribe
                      key={item.id}
                      selector={(state) => state.values.frame}
                      children={(selectedFrameId) => {
                        const selectedFrame = FRAMES?.find(
                          (item) => item.id === selectedFrameId
                        );

                        return (
                          <Button
                            type="button"
                            disabled={!item.isUnlocked}
                            onClick={() => {
                              form.setFieldValue("frame", item.id);
                            }}
                            className={`w-16 h-16 flex items-center justify-center relative border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 m-auto`}
                            style={{
                              ...getFrameById(item?.id)?.style,
                              backgroundColor: user.background,
                            }}
                          >
                            {selectedFrame?.id === item.id &&
                              item.isUnlocked && (
                                <div className="w-6 h-6 rounded-full absolute right-0 bottom-0 bg-green-400 flex items-center justify-center text-white">
                                  <Check size={14} />
                                </div>
                              )}

                            {!item.isUnlocked && (
                              <div className="w-6 h-6 rounded-full absolute right-0 bottom-0 bg-green-400 flex items-center justify-center text-white">
                                <Lock size={14} />
                              </div>
                            )}
                          </Button>
                        );
                      }}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="background">
                <div className="grid grid-cols-3 gap-4">
                  {BACKGROUND?.map((item) => (
                    <form.Subscribe
                      key={item.id}
                      selector={(state) => state.values.background}
                      children={(selectedBgId) => {
                        const selectedBg = BACKGROUND?.find(
                          (item) => item.id === selectedBgId
                        );

                        return (
                          <Button
                            type="button"
                            onClick={() => {
                              form.setFieldValue("background", item.id);
                            }}
                            className={`w-16 h-16 flex items-center justify-center relative border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 m-auto`}
                            style={{
                              ...getFrameById(user.frame)?.style,
                              backgroundColor: item?.color,
                            }}
                          >
                            {selectedBg?.id === item.id && (
                              <div className="w-6 h-6 rounded-full absolute right-0 bottom-0 bg-green-400 flex items-center justify-center text-white">
                                <Check size={14} />
                              </div>
                            )}
                          </Button>
                        );
                      }}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="submit"
                isLoading={isPending}
                className="w-full bg-linear-to-r from-pink-500 to-orange-400 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 text-black"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
