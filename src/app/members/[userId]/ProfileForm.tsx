"use client";

import { Controller, Path, useForm } from "react-hook-form";
import { Member } from "../../../../generated/prisma/client";
import {
  profileEditSchema,
  ProfileEditSchema,
} from "@/lib/schemas/profileEditSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  FieldError,
  Input,
  Label,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import { updateProfile } from "@/server/actions/members";

type Props = {
  member: Member;
};
export default function ProfileForm({ member }: Props) {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<ProfileEditSchema>({
    resolver: zodResolver(profileEditSchema),
    mode: 'onChange',
    defaultValues: {
      name: member.name ?? "",
      description: member.description ?? "",
      city: member.city ?? "",
      country: member.country ?? "",
    },
  });

  const onSubmit = async (data: ProfileEditSchema) => {
    const result = await updateProfile(data);

    if (result.status === "success") {
      toast.success("Profile has been updated");
      reset(data);
    } else {
      if (Array.isArray(result.error)) {
        result.error.forEach((err) => {
          setError(err.path as Path<unknown>, { message: err.message });
        });
      } else {
        toast.danger(result.error);
      }
    }
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 w-full"
    >
      {/* Name */}
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextField aria-label="name" isInvalid={!!errors.name}>
            <Label>Display name</Label>
            <Input
              {...field}
              value={field.value ?? ""}
              placeholder="Enter your name"
            />
            <FieldError>{errors.name?.message}</FieldError>
          </TextField>
        )}
      />

      {/* Description */}
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <TextField aria-label="description" isInvalid={!!errors.description}>
            <Label>Description</Label>
            <TextArea
              {...field}
              value={field.value ?? ""}
              rows={4}
              placeholder="Enter your description"
            />
            <FieldError>{errors.description?.message}</FieldError>
          </TextField>
        )}
      />

      <div className="flex items-center justify-between gap-3 w-full">
        {/* City */}
        <Controller
          control={control}
          name="city"
          render={({ field }) => (
            <TextField
              className="w-full"
              aria-label="city"
              isInvalid={!!errors.city}
            >
              <Label>City</Label>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Enter your city"
              />
              <FieldError>{errors.city?.message}</FieldError>
            </TextField>
          )}
        />

        {/* Country */}
        <Controller
          control={control}
          name="country"
          render={({ field }) => (
            <TextField
              className="w-full"
              aria-label="country"
              isInvalid={!!errors.country}
            >
              <Label>Country</Label>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Enter your country"
              />
              <FieldError>{errors.country?.message}</FieldError>
            </TextField>
          )}
        />
      </div>
      <Button
        type="submit"
        className="flex self-end mt-3"
        isPending={isSubmitting}
        isDisabled={!isDirty || !isValid}
      >
        Update profile
      </Button>
    </form>
  );
}
