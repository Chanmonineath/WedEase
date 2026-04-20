// backend/src/models/Gift.js

const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/db");

const collectionName = "gifts";
const getGiftsCollection = () => getDatabase().collection(collectionName);

const createGift = async (giftData) => {
  const now = new Date();
  const giftDocument = {
    type: giftData.type || "money",
    budget: giftData.budget || 0,
    guestId: giftData.guestId || null,
    userId: giftData.userId ? new ObjectId(giftData.userId) : null,
    createdAt: now,
    updatedAt: now,
  };
  const result = await getGiftsCollection().insertOne(giftDocument);
  return { ...giftDocument, _id: result.insertedId };
};

const listGifts = async (userId) => {
  const filter = userId ? { userId: new ObjectId(userId) } : {};
  return getGiftsCollection().find(filter).sort({ createdAt: 1 }).toArray();
};

const findGiftById = async (id) => {
  if (!ObjectId.isValid(id)) return null;
  return getGiftsCollection().findOne({ _id: new ObjectId(id) });
};

const updateGift = async (id, userId, updates) => {
  if (!ObjectId.isValid(id)) return null;
  const now = new Date();

  // Remove _id and userId from updates to prevent overwriting
  const { _id, userId: _uid, ...safeUpdates } = updates;

  const result = await getGiftsCollection().findOneAndUpdate(
    { _id: new ObjectId(id), userId: new ObjectId(userId) },
    { $set: { ...safeUpdates, updatedAt: now } },
    { returnDocument: "after" }
  );
  return result;
};

const deleteGift = async (id, userId) => {
  if (!ObjectId.isValid(id)) return false;
  const result = await getGiftsCollection().deleteOne({
    _id: new ObjectId(id),
    userId: new ObjectId(userId),
  });
  return result.deletedCount > 0;
};

module.exports = {
  createGift,
  listGifts,
  findGiftById,
  updateGift,
  deleteGift,
};