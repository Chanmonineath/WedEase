// backend/src/models/Invitation.js - Firebase Version
const { db } = require('../config/firebase');
const crypto = require('crypto');

const INVITATIONS_COLLECTION = 'invitations';
const GUEST_INVITES_COLLECTION = 'guest_invites';

// Generate unique tracking token
const generateTrackingToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Create a new invitation template
const createInvitation = async (invitationData) => {
  const now = new Date().toISOString();
  const invitationDocument = {
    ...invitationData,
    uniqueLink: `/rsvp/${generateTrackingToken()}`,
    trackingToken: generateTrackingToken(),
    userId: invitationData.userId,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await db.collection(INVITATIONS_COLLECTION).add(invitationDocument);
  return { id: docRef.id, ...invitationDocument };
};

// Send invitation to specific guest
const sendInvitationToGuest = async (invitationId, guestData) => {
  const now = new Date().toISOString();
  const token = generateTrackingToken();
  
  const guestInvite = {
    invitationId: invitationId,
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

  const docRef = await db.collection(GUEST_INVITES_COLLECTION).add(guestInvite);
  return { id: docRef.id, ...guestInvite };
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
  
  const snapshot = await db.collection(GUEST_INVITES_COLLECTION)
    .where('trackingToken', '==', token)
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  
  let docId = null;
  snapshot.forEach(doc => {
    docId = doc.id;
  });
  
  const updateData = {
    rsvpStatus,
    rsvpDate: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  if (guestCount) updateData.guestCount = guestCount;
  if (dietaryRestrictions) updateData.dietaryRestrictions = dietaryRestrictions;
  if (notes) updateData.notes = notes;
  
  await db.collection(GUEST_INVITES_COLLECTION).doc(docId).update(updateData);
  
  const updated = await db.collection(GUEST_INVITES_COLLECTION).doc(docId).get();
  return { id: updated.id, ...updated.data() };
};

// Get invitation by token
const getInvitationByToken = async (token) => {
  const snapshot = await db.collection(GUEST_INVITES_COLLECTION)
    .where('trackingToken', '==', token)
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  
  let invite = null;
  snapshot.forEach(doc => {
    invite = { id: doc.id, ...doc.data() };
  });
  return invite;
};

// List all invitations for a user
const listInvitations = async (userId) => {
  const snapshot = await db.collection(INVITATIONS_COLLECTION)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  
  const invitations = [];
  snapshot.forEach(doc => {
    invitations.push({ id: doc.id, ...doc.data() });
  });
  return invitations;
};

// List guest invites for an invitation
const listGuestInvites = async (invitationId) => {
  const snapshot = await db.collection(GUEST_INVITES_COLLECTION)
    .where('invitationId', '==', invitationId)
    .get();
  
  const guests = [];
  snapshot.forEach(doc => {
    guests.push({ id: doc.id, ...doc.data() });
  });
  return guests;
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
  const guestInvites = await listGuestInvites(id);
  for (const invite of guestInvites) {
    await db.collection(GUEST_INVITES_COLLECTION).doc(invite.id).delete();
  }
  
  // Delete the invitation
  await db.collection(INVITATIONS_COLLECTION).doc(id).delete();
  return true;
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