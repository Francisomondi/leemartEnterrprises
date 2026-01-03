import Queue from "bull";
import cloudinary from "../lib/cloudinary.js";
//import redis from "../lib/redis.js";

const imageQueue = new Queue("image-upload", {
  redis: {
    url: process.env.REDIS_URL,
  },
});

imageQueue.process(async (job) => {
  const { buffer, mimetype } = job.data;

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    ).end(buffer);
  });
});

export default imageQueue;
