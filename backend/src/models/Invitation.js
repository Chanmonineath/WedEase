// backend/src/models/Invitation.js - MongoDB Version
const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/db");
const crypto = require("crypto");

const INVITATIONS_COLLECTION = 'invitations';
const GUEST_INVITES_COLLECTION = 'guest_invites';

const getInvitationsCollection = () => getDatabase().collection(INVITATIONS_COLLECTION);
const getGuestInvitesCollection = () => getDatabase().collection(GUEST_INVITES_COLLECTION);

// Generate unique tracking token
const generateTrackingToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Create a new invitation template
const createInvitation = async (invitationData) => {
  const now = new Date();
  const invitationDocument = {
    ...invitationData,
    uniqueLink: `/rsvp/${generateTrackingToken()}`,
    trackingToken: generateTrackingToken(),
    userId: invitationData.userId,
    createdAt: now,
    updatedAt: now,
  };

  const result = await getInvitationsCollection().insertOne(invitationDocument);
  return { ...invitationDocument, _id: result.insertedId };
};

// Send invitation to specific guest
const sendInvitationToGuest = async (invitationId, guestData) => {
  const now = new Date();
  const token = generateTrackingToken();
  
  const guestInvite = {
    invitationId: new ObjectId(invitationId),
    guestId: guestData.id || guestData._id,
    guestName: guestData.name,
    guestEmail: guestData.email,
    guestPhone: guestData.phone || "",
    guestCount: guestData.guestCount || 1,
    dietaryRestrictions: guestData.dietaryRestrictions || "",
    uniqueLink: `/rsvp/${token}`,
    trackingToken: token,
    status: "sent",
    rsvpStatus: "pending",
    rsvpDate: null,
    notes: "",
    createdAt: now,
    updatedAt: now,
  };

  const result = await getGuestInvitesCollection().insertOne(guestInvite);
  return { ...guestInvite, _id: result.insertedId };
};

// Bulk send invitations
const bulkSendInvitations = async (invitationId, guests) => {
  const results = [];
  for (const guest of guests) {
    const result = await sendInvitationToGuest(invitationId, guest);
    results.push(result);
  }
  return results;
};

// Update RSVP status
const updateRSVP = async (token, rsvpData) => {
  const { rsvpStatus, guestCount, dietaryRestrictions, notes } = rsvpData;
  const update = {
    rsvpStatus,
    rsvpDate: new Date(),
    updatedAt: new Date(),
  };

  if (guestCount) update.guestCount = guestCount;
  if (dietaryRestrictions) update.dietaryRestrictions = dietaryRestrictions;
  if (notes) update.notes = notes;

  const result = await getGuestInvitesCollection().findOneAndUpdate(
    { trackingToken: token },
    { $set: update },
    { returnDocument: 'after' }
  );

  return result;
};

// Get invitation by token
const getInvitationByToken = async (token) => {
  return getGuestInvitesCollection().findOne({ trackingToken: token });
};

// List all invitations for a user
const listInvitations = async (userId) => {
  return getInvitationsCollection()
    .find({ userId: userId })
    .sort({ createdAt: -1 })
    .toArray();
};

// List guest invites for an invitation
const listGuestInvites = async (invitationId) => {
  return getGuestInvitesCollection()
    .find({ invitationId: new ObjectId(invitationId) })
    .toArray();
};

// Get RSVP statistics
const getRSVPStats = async (invitationId) => {
  const invites = await listGuestInvites(invitationId);
  
  return {
    total: invites.length,
    confirmed: invites.filter(i => i.rsvpStatus === "confirmed").length,
    pending: invites.filter(i => i.rsvpStatus === "pending").length,
    declined: invites.filter(i => i.rsvpStatus === "declined").length,
    totalGuests: invites.reduce(
      (sum, i) => sum + (i.rsvpStatus === "confirmed" ? (i.guestCount || 1) : 0),
      0,
    ),
  };
};

// Delete invitation
const deleteInvitation = async (id) => {
  // Delete all guest invites first
  await getGuestInvitesCollection().deleteMany({ invitationId: new ObjectId(id) });
  
  // Delete the invitation
  const result = await getInvitationsCollection().deleteOne({ _id: new ObjectId(id) });
  return result;
};

module.exports = {
  createInvitation,
  sendInvitationToGuest,
  bulkSendInvitations,
  updateRSVP,
  getInvitationByToken,
  listInvitations,
  listGuestInvites,
  getRSVPStats,
  deleteInvitation,
};
