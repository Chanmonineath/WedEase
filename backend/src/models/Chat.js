const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/db");

const collectionName = "chats";

const getChatsCollection = () => getDatabase().collection(collectionName);

const createChatSession = async (userId, messages = []) => {
  const now = new Date();
  let title = "New Conversation";
  
  if (messages.length > 0) {
    const firstUserMsg = messages.find(m => m.role === "user");
    if (firstUserMsg) {
      title = firstUserMsg.content.substring(0, 50);
    }
  }
  
  const chatDocument = {
    userId: new ObjectId(userId),
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: now
    })),
    title: title,
    createdAt: now,
    updatedAt: now,
  };

  const result = await getChatsCollection().insertOne(chatDocument);
  return { ...chatDocument, _id: result.insertedId };
};

const addMessageToChat = async (chatId, userId, role, content) => {
  const now = new Date();
  const result = await getChatsCollection().updateOne(
    { _id: new ObjectId(chatId), userId: new ObjectId(userId) },
    {
      $push: { messages: { role, content, timestamp: now } },
      $set: { updatedAt: now }
    }
  );
  return result.modifiedCount > 0;
};

const getUserChats = async (userId) => {
  return getChatsCollection()
    .find({ userId: new ObjectId(userId) })
    .sort({ updatedAt: -1 })
    .toArray();
};

const getChatById = async (chatId, userId) => {
  if (!ObjectId.isValid(chatId)) return null;
  return getChatsCollection().findOne({
    _id: new ObjectId(chatId),
    userId: new ObjectId(userId)
  });
};

const deleteChat = async (chatId, userId) => {
  if (!ObjectId.isValid(chatId)) return false;
  const result = await getChatsCollection().deleteOne({
    _id: new ObjectId(chatId),
    userId: new ObjectId(userId)
  });
  return result.deletedCount > 0;
};

module.exports = {
  createChatSession,
  addMessageToChat,
  getUserChats,
  getChatById,
  deleteChat,
};