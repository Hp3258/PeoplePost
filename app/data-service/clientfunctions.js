import { supabaseClient } from "./supabaseClient";
import imageCompression from "browser-image-compression";

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
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  const imagesToTheBucket = await Promise.all(
    images.map(async (image) => {
      try {
        const compressedFile = await imageCompression(image, options);
        const imageName = `${Math.random()}-${compressedFile.name}`;
        return new File([compressedFile], imageName, { type: compressedFile.type });
      } catch (error) {
        console.error("Image compression error:", error);
        // Fallback to original if compression fails
        const imageName = `${Math.random()}-${image.name}`;
        return new File([image], imageName, { type: image.type });
      }
    })
  );

  if (!lat) lat = null;
  if (!lng) lng = null;

  // Await all image uploads properly
  const uploadPromises = imagesToTheBucket.map(async (image) => {
    const { error } = await supabaseClient.storage
      .from("images")
      .upload(image.name, image);
    if (error) throw error;
    return image.name;
  });

  await Promise.all(uploadPromises);

  const imageUrls = imagesToTheBucket.map((image) => {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${image.name}`;
  });

  // Call the new Deep Learning ML API
  let predictedCategory = category;
  let severity = "Medium";
  let embedding = null;

  try {
    const mlApiUrl = process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:5000";
    
    // 5-second timeout for ML API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const mlResponse = await fetch(`${mlApiUrl}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        description: description,
        image_url: imageUrls.length > 0 ? imageUrls[0] : null
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (mlResponse.ok) {
      const mlData = await mlResponse.json();
      // If user selected "Other" or didn't select, use AI prediction
      if (!category || category === "Other") {
        predictedCategory = mlData.category;
      }
      severity = mlData.severity;
      embedding = mlData.embedding;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log("ML API timed out after 5 seconds, falling back to defaults");
    } else {
      console.log("ML API unavailable, falling back to defaults", error);
    }
  }

  const report = {
    title,
    description,
    category: predictedCategory,
    severity,
    embedding,
    imageUrls,
    lat,
    lng,
    userId,
    address,
    status: "NEW",
  };

  const { data, error } = await supabaseClient.from("reports").insert([report]).select();
  if (error) {
    console.log("Supabase Insert Error:", error);
    return null;
  }
  
  return { data, predictedCategory, severity };
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
