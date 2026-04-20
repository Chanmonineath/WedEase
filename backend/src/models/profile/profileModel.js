const { connectToDatabase } = require("../../config/db");
const { ObjectId } = require("mongodb");

const COLLECTION_NAME = "profiles";

const getCollection = async () => {
  const db = await connectToDatabase();
  return db.collection(COLLECTION_NAME);
};

const createProfile = async (userId, profileData, options = {}) => {
  const collection = await getCollection();
  const userObjectId = new ObjectId(userId);

  const existingProfile = await collection.findOne(
    { userId: userObjectId, deletedAt: null },
    { session: options.session },
  );
  if (existingProfile) throw new Error("Profile already exists");

  const newProfile = {
    _id: new ObjectId(),
    userId: userObjectId,
    displayName: profileData.displayName,
    bio: profileData.bio || "",
    interest: profileData.interest || [],
    profilePicture: profileData.profilePicture || "",
    coverImage: profileData.coverImage || "",
    posts: 0,
    followers: 0,
    following: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  try {
    const result = await collection.insertOne(newProfile, {
      session: options.session,
    });
    return result.insertedId;
  } catch (error) {
    if (error?.code === 11000) throw new Error("Profile already exists");
    throw error;
  }
};

const softDeleteProfileByUserId = async (userId, options = {}) => {
  if (!ObjectId.isValid(userId)) throw new Error("Invalid user id");
  const collection = await getCollection();
  const deletedAt = new Date();
  const result = await collection.updateOne(
    { userId: new ObjectId(userId), deletedAt: null },
    { $set: { deletedAt, updatedAt: deletedAt } },
    { session: options.session },
  );
  if (result.matchedCount === 0)
    throw new Error("Profile not found for userId");
  return result;
};

module.exports = {
  createProfile,
  softDeleteProfileByUserId,
};
