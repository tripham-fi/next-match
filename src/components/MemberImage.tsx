"use client";

import { CldImage } from "next-cloudinary";
import { Photo } from "../../generated/prisma/client";
import Image from "next/image";

type Props = {
  photo: Photo;
};

export default function MemberImage({ photo }: Props) {
  return (
    <div>
      {photo.publicId ? (
        <CldImage
          alt="Image of member"
          src={photo.url}
          width={300}
          height={300}
          crop="fill"
          gravity="face"
          className="rounded-xl"
          loading="eager"
        />
      ) : (
        <Image
          alt="image of member"
          width={300}
          height={300}
          loading="eager"
          sizes="(max-width: 768px) 100vw, 33vw" // ≤768px: image is 100vw (full width). >768px: image is 33vw (about one third).
          src={photo.url}
          className="aspect-square object-cover rounded-xl relative"
        />
      )}
    </div>
  );
}
