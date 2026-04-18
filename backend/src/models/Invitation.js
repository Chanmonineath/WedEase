const { ObjectId } = require("mongodb");

const { getDatabase } = require("../config/db");

const collectionName = "invitations";

const getInvitationsCollection = () => getDatabase().collection(collectionName);

const createInvitation = async (invitationData) => {
  const now = new Date();
  const invitationDocument = {
    ...invitationData,
    createdAt: now,
    updatedAt: now,
  };

  const result = await getInvitationsCollection().insertOne(invitationDocument);

  return {
    ...invitationDocument,
    _id: result.insertedId,
  };
};

const listInvitations = async () =>
  getInvitationsCollection().find({}).toArray();

const findInvitationById = async (id) => {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return getInvitationsCollection().findOne({ _id: new ObjectId(id) });
};

module.exports = {
  createInvitation,
  listInvitations,
  findInvitationById,
};
