// backend/src/models/GuestFirebase.js
const { db } = require("../config/firebase");
const crypto = require("crypto");

const COLLECTION = "guests";

// Generate unique tracking token
const generateTrackingToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Get all guests for a user
const getGuestsByUserId = async (userId) => {
  try {
    const snapshot = await db
      .collection(COLLECTION)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const guests = [];
    snapshot.forEach((doc) => {
      guests.push({ id: doc.id, ...doc.data() });
    });
    return guests;
  } catch (error) {
    console.error("Error getting guests:", error);
    return [];
  }
};

// Create a new guest
const createGuest = async (guestData) => {
  const now = new Date().toISOString();
  const guest = {
    name: guestData.name,
    email: guestData.email,
    phone: guestData.phone || "",
    guestCount: guestData.guestCount || 1,
    dietaryRestrictions: guestData.dietaryRestrictions || "",
    userId: guestData.userId,
    trackingToken: null,
    invitationLink: null,
    status: "pending",
    rsvpStatus: "pending",
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await db.collection(COLLECTION).add(guest);
  return { id: docRef.id, ...guest };
};

// Get guest by ID
const getGuestById = async (id, userId) => {
  const docRef = db.collection(COLLECTION).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) return null;
  const guest = { id: doc.id, ...doc.data() };

  // Verify ownership
  if (guest.userId !== userId) return null;
  return guest;
};

// Get guest by tracking token (for RSVP page)
const getGuestByToken = async (token) => {
  const snapshot = await db
    .collection(COLLECTION)
    .where("trackingToken", "==", token)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  let guest = null;
  snapshot.forEach((doc) => {
    guest = { id: doc.id, ...doc.data() };
  });
  return guest;
};

// Update RSVP response
const updateRSVP = async (token, rsvpData) => {
  const snapshot = await db
    .collection(COLLECTION)
    .where("trackingToken", "==", token)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  let docId = null;
  snapshot.forEach((doc) => {
    docId = doc.id;
  });

  await db
    .collection(COLLECTION)
    .doc(docId)
    .update({
      rsvpStatus: rsvpData.rsvpStatus,
      rsvpData: {
        guestCount: rsvpData.guestCount,
        dietaryRestrictions: rsvpData.dietaryRestrictions,
        notes: rsvpData.notes,
        responseDate: new Date().toISOString(),
      },
      status: "responded",
      updatedAt: new Date().toISOString(),
    });

  return { token, ...rsvpData };
};

// Send invitations (generate tracking links)
const sendInvitations = async (
  guestIds,
  userId,
  invitationDetails,
  baseUrl,
) => {
  const updatedGuests = [];

  for (const guestId of guestIds) {
    const token = generateTrackingToken();
    const invitationLink = `${baseUrl}/rsvp.html?token=${token}`;

    await db.collection(COLLECTION).doc(guestId).update({
      trackingToken: token,
      invitationLink: invitationLink,
      status: "sent",
      invitationDetails: invitationDetails,
      updatedAt: new Date().toISOString(),
    });

    const guest = await getGuestById(guestId, userId);
    updatedGuests.push(guest);
  }

  return updatedGuests;
};

// Delete guest
const deleteGuest = async (id, userId) => {
  const guest = await getGuestById(id, userId);
  if (!guest) return false;

  await db.collection(COLLECTION).doc(id).delete();
  return true;
};

// Delete all guests for a user
const deleteAllGuests = async (userId) => {
  const guests = await getGuestsByUserId(userId);

  for (const guest of guests) {
    await db.collection(COLLECTION).doc(guest.id).delete();
  }

  return guests.length;
};

// Bulk create guests
const bulkCreateGuests = async (guestsArray, userId) => {
  const now = new Date().toISOString();
  const results = [];
  const batch = db.batch();

  console.log(
    "📤 Bulk creating:",
    guestsArray.length,
    "guests for user:",
    userId,
  );

  for (const guest of guestsArray) {
    const docRef = db.collection(COLLECTION).doc();
    const guestData = {
      name: guest.name,
      email: guest.email,
      phone: guest.phone || "",
      guestCount: guest.guestCount || 1,
      dietaryRestrictions: guest.dietaryRestrictions || "",
      userId: userId,
      trackingToken: null,
      invitationLink: null,
      status: "pending",
      rsvpStatus: "pending",
      rsvpData: null,
      invitationDetails: null,
      createdAt: now,
      updatedAt: now,
    };
    batch.set(docRef, guestData);
    results.push({ id: docRef.id, ...guestData });
  }

  await batch.commit();
  console.log("✅ Batch commit complete, added:", results.length, "guests");

  return results;
};

// Get RSVP statistics
const getRSVPStats = async (userId) => {
  const guests = await getGuestsByUserId(userId);

  return {
    total: guests.length,
    sent: guests.filter((g) => g.status === "sent").length,
    confirmed: guests.filter((g) => g.rsvpStatus === "confirmed").length,
    pending: guests.filter(
      (g) => g.status === "sent" && g.rsvpStatus === "pending",
    ).length,
    declined: guests.filter((g) => g.rsvpStatus === "declined").length,
  };
};

module.exports = {
  createGuest,
  getGuestsByUserId,
  getGuestById,
  getGuestByToken,
  updateRSVP,
  sendInvitations,
  deleteGuest,
  deleteAllGuests,
  bulkCreateGuests,
  getRSVPStats,
};
