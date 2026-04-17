const { ObjectId } = require("mongodb");

const { getDatabase } = require("../config/db");

const collectionName = "guests";

const getGuestsCollection = () => getDatabase().collection(collectionName);

const createGuest = async (guestData) => {
  const now = new Date();
  const guestDocument = {
    ...guestData,
    createdAt: now,
    updatedAt: now,
  };

  const result = await getGuestsCollection().insertOne(guestDocument);

  return {
    ...guestDocument,
    _id: result.insertedId,
  };
};

const listGuests = async () => getGuestsCollection().find({}).toArray();

const findGuestById = async (id) => {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return getGuestsCollection().findOne({ _id: new ObjectId(id) });
};

module.exports = {
  createGuest,
  listGuests,
  findGuestById,
};
