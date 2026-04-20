// backend/src/models/Guest.js

const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/db");

const collectionName = "guests";
const getGuestsCollection = () => getDatabase().collection(collectionName);

const createGuest = async (guestData) => {
  const now = new Date();
  const guestDocument = {
    name: guestData.name,
    group: guestData.group || "",
    rsvp: guestData.rsvp || "pending",
    seatTableId: guestData.seatTableId || null,
    seatZone: guestData.seatZone || null,
    userId: guestData.userId ? new ObjectId(guestData.userId) : null,
    createdAt: now,
    updatedAt: now,
  };
  const result = await getGuestsCollection().insertOne(guestDocument);
  return { ...guestDocument, _id: result.insertedId };
};

const listGuests = async (userId) => {
  const filter = userId ? { userId: new ObjectId(userId) } : {};
  return getGuestsCollection().find(filter).sort({ createdAt: 1 }).toArray();
};

const findGuestById = async (id) => {
  if (!ObjectId.isValid(id)) return null;
  return getGuestsCollection().findOne({ _id: new ObjectId(id) });
};

const updateGuest = async (id, userId, updates) => {
  if (!ObjectId.isValid(id)) return null;
  const now = new Date();

  // Remove _id and userId from updates to prevent overwriting
  const { _id, userId: _uid, ...safeUpdates } = updates;

  const result = await getGuestsCollection().findOneAndUpdate(
    { _id: new ObjectId(id), userId: new ObjectId(userId) },
    { $set: { ...safeUpdates, updatedAt: now } },
    { returnDocument: "after" }
  );
  return result;
};

const deleteGuest = async (id, userId) => {
  if (!ObjectId.isValid(id)) return false;
  const result = await getGuestsCollection().deleteOne({
    _id: new ObjectId(id),
    userId: new ObjectId(userId),
  });
  return result.deletedCount > 0;
};

module.exports = {
  createGuest,
  listGuests,
  findGuestById,
  updateGuest,
  deleteGuest,
};
