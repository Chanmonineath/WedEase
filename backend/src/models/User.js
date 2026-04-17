const { ObjectId } = require("mongodb");

const { getDatabase } = require("../config/db");

const collectionName = "users";

const getUsersCollection = () => getDatabase().collection(collectionName);

const normalizeEmail = (email) => email.trim().toLowerCase();

const createUser = async (userData) => {
  const now = new Date();
  const userDocument = {
    ...userData,
    email: normalizeEmail(userData.email),
    createdAt: now,
    updatedAt: now,
  };

  const result = await getUsersCollection().insertOne(userDocument);

  return {
    ...userDocument,
    _id: result.insertedId,
  };
};

const findUserByEmail = async (email) =>
  getUsersCollection().findOne({ email: normalizeEmail(email) });

const findUserById = async (id) => {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return getUsersCollection().findOne({ _id: new ObjectId(id) });
};

const listUsers = async () => getUsersCollection().find({}).toArray();

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  listUsers,
};
