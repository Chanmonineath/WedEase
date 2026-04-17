const { ObjectId } = require("mongodb");

const { getDatabase } = require("../config/db");

const collectionName = "gifts";

const getGiftsCollection = () => getDatabase().collection(collectionName);

const createGift = async (giftData) => {
  const now = new Date();
  const giftDocument = {
    ...giftData,
    createdAt: now,
    updatedAt: now,
  };

  const result = await getGiftsCollection().insertOne(giftDocument);

  return {
    ...giftDocument,
    _id: result.insertedId,
  };
};

const listGifts = async () => getGiftsCollection().find({}).toArray();

const findGiftById = async (id) => {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return getGiftsCollection().findOne({ _id: new ObjectId(id) });
};

module.exports = {
  createGift,
  listGifts,
  findGiftById,
};
