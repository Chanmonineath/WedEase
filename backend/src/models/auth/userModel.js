const { connectToDatabase, getClient } = require("../../config/db");
const { ObjectId } = require("mongodb");
const { normalizeEmail } = require("../../utils/email");

const COLLECTION_NAME = "users";

const setNormalizedEmail = (userData) => {
  return {
    ...userData,
    email: normalizeEmail(userData.email),
  };
};

const getCollection = async () => {
  const db = await connectToDatabase();
  return db.collection(COLLECTION_NAME);
};

const createUser = async (userData, options = {}) => {
  const collection = await getCollection();
  const normalizedUserData = setNormalizedEmail(userData);

  const user = {
    username: normalizedUserData.username,
    email: normalizedUserData.email,
    password: normalizedUserData.password,
    role: normalizedUserData.role || "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const result = await collection.insertOne(user, { session: options.session });
  return result.insertedId;
};

const findUserByEmail = async (email) => {
  const collection = await getCollection();
  return collection.findOne({
    email: normalizeEmail(email),
    deletedAt: null,
  });
};

const findUserByEmailIncludingDeleted = async (email) => {
  const collection = await getCollection();
  return collection.findOne({
    email: normalizeEmail(email),
    deletedAt: { $ne: null },
  });
};

const findUserById = async (id) => {
  const collection = await getCollection();
  return collection.findOne({ _id: new ObjectId(id) });
};

const findActiveUserById = async (id) => {
  const collection = await getCollection();
  return collection.findOne({ _id: new ObjectId(id), deletedAt: null });
};

const updateUserEmailById = async (id, email, options = {}) => {
  const collection = await getCollection();
  const result = await collection.updateOne(
    { _id: new ObjectId(id), deletedAt: null },
    { $set: { email: normalizeEmail(email), updatedAt: new Date() } },
    { session: options.session },
  );

  if (!result.matchedCount) throw new Error("User not found");
  return result;
};

const updateUserPasswordById = async (id, passwordHash, options = {}) => {
  const collection = await getCollection();
  const result = await collection.updateOne(
    { _id: new ObjectId(id), deletedAt: null },
    { $set: { password: passwordHash, updatedAt: new Date() } },
    { session: options.session },
  );

  if (!result.matchedCount) throw new Error("User not found");
  return result;
};

const softDeleteUserById = async (id, options = {}) => {
  const collection = await getCollection();
  const deletedAt = new Date();
  const result = await collection.updateOne(
    { _id: new ObjectId(id), deletedAt: null },
    { $set: { deletedAt, updatedAt: deletedAt } },
    { session: options.session },
  );

  if (!result.matchedCount) throw new Error("User not found");
  return result;
};

const restoreUserById = async (id, options = {}) => {
  const collection = await getCollection();
  const result = await collection.updateOne(
    { _id: new ObjectId(id), deletedAt: { $ne: null } },
    { $set: { deletedAt: null, updatedAt: new Date() } },
    { session: options.session },
  );

  if (!result.matchedCount) throw new Error("User not found");
  return result;
};

const deleteUserById = async (id) => {
  const collection = await getCollection();
  if (typeof id === "string" && !ObjectId.isValid(id))
    throw new Error("Invalid user id");
  const userId = typeof id === "string" ? new ObjectId(id) : id;
  const result = await collection.deleteOne({ _id: userId });
  if (result.deletedCount !== 1)
    throw new Error("Rollback delete did not remove a user");
  return result;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByEmailIncludingDeleted,
  findUserById,
  findActiveUserById,
  updateUserEmailById,
  updateUserPasswordById,
  softDeleteUserById,
  restoreUserById,
  deleteUserById,
  setNormalizedEmail,
};
