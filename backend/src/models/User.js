const { ObjectId } = require("mongodb");
const crypto = require("crypto");

const { getDatabase } = require("../config/db");

const collectionName = "users";

const getUsersCollection = () => getDatabase().collection(collectionName);

const hashPassword = (password, salt = crypto.randomBytes(16).toString("hex")) => {
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return { salt, hash };
};

const verifyPassword = (password, salt, hash) => {
  const computedHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return computedHash === hash;
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const createUser = async (userData) => {
  const now = new Date();
  const { salt, hash } = hashPassword(userData.password);
  
  const userDocument = {
    name: userData.name,
    email: normalizeEmail(userData.email),
    passwordHash: hash,
    passwordSalt: salt,
    role: userData.role || "user",
    createdAt: now,
    updatedAt: now,
  };

  const result = await getUsersCollection().insertOne(userDocument);
  return {
    _id: result.insertedId,
    name: userDocument.name,
    email: userDocument.email,
    role: userDocument.role,
    createdAt: userDocument.createdAt,
  };
};

const findUserByEmail = async (email) => {
  const user = await getUsersCollection().findOne({ email: normalizeEmail(email) });
  if (!user) return null;
  return user;
};

const findUserById = async (id) => {
  if (!ObjectId.isValid(id)) return null;
  const user = await getUsersCollection().findOne({ _id: new ObjectId(id) });
  if (!user) return null;
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
};

const validateUserCredentials = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) return null;
  
  const isValid = verifyPassword(password, user.passwordSalt, user.passwordHash);
  if (!isValid) return null;
  
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  validateUserCredentials,
};