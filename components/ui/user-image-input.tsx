import { Avatar } from "@heroui/react";
import { IconCamera } from "@tabler/icons-react";
import React from "react";

import defaultAvatar from "@/public/user.png";

type Props = {
  handleFormImage: (image: File | null, imageUrl: string) => void;
  avatarPreview: string;
};
export default function UserImageInput({
  handleFormImage,
  avatarPreview,
}: Props) {
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);

      handleFormImage(file, imageUrl);
    }
  };

  return (
    <figure className="relative size-fit">
      <Avatar
        alt="User profile image"
        className="h-34 w-34 rounded-full object-cover"
        data-testid="user-image"
        src={avatarPreview || defaultAvatar.src}
        title="User profile image"
      />
      <label className="absolute bottom-0 right-0 flex size-3/12 cursor-pointer items-center justify-center rounded-full bg-white p-2 shadow-md transition hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700">
        <IconCamera size={35} />
        <input
          accept="image/*"
          className="hidden"
          type="file"
          onChange={handleImageChange}
        />
      </label>
    </figure>
  );
}
