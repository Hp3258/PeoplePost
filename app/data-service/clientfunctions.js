import { supabaseClient } from "./supabaseClient";

export async function submitReport(
  title,
  description,
  category,
  images,
  lat,
  lng,
  userId,
  address
) {
  const imagesToTheBucket = images.map((image) => {
    const imageName = `${Math.random()}-${image.name}`;
    return new File([image], imageName, { type: image.type });
  });
  if (!lat) lat = null;
  if (!lng) lng = null;
  imagesToTheBucket.map(async (image) => {
    const { error } = await supabaseClient.storage
      .from("images")
      .upload(image.name, image);
    if (error) {
      console.log(error);
    }
  });
  const imageUrls = imagesToTheBucket.map((image) => {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${image.name}`;
  });

  const report = {
    title,
    description,
    category,
    imageUrls,
    lat,
    lng,
    userId,
    address,
    status: "NEW",
  };
  const { data, error } = await supabaseClient.from("reports").insert([report]);
  if (error) {
    console.log(error);
    return;
  }
  return data;
}

export async function uploadResolutionImages(images) {
  const imagesToTheBucket = images.map((image) => {
    const imageName = `resolution-${Math.random()}-${image.name}`;
    return new File([image], imageName, { type: image.type });
  });

  // Upload images to Supabase Storage
  const uploadPromises = imagesToTheBucket.map(async (image) => {
    const { error } = await supabaseClient.storage
      .from("images")
      .upload(image.name, image);
    if (error) {
      console.log(error);
      throw error;
    }
    return image.name;
  });

  await Promise.all(uploadPromises);

  // Generate public URLs
  const imageUrls = imagesToTheBucket.map((image) => {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${image.name}`;
  });

  return imageUrls;
}
