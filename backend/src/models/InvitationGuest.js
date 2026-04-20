// backend/src/models/InvitationGuest.js
const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/db");
const crypto = require("crypto");

const collectionName = "invitations";

const getInvitationsCollection = () => getDatabase().collection(collectionName);

// Generate unique tracking token
const generateTrackingToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Create a guest invitation
const createInvitationGuest = async (guestData) => {
  const now = new Date();
  const guestDocument = {
    name: guestData.name,
    email: guestData.email,
    phone: guestData.phone || "",
    guestCount: guestData.guestCount || 1,
    dietaryRestrictions: guestData.dietaryRestrictions || "",
    userId: new ObjectId(guestData.userId),
    trackingToken: null,
    invitationLink: null,
    status: "pending",
    rsvpStatus: "pending",
    rsvpData: null,
    type: "guest_invitation", // Distinguish from invitation templates
    createdAt: now,
    updatedAt: now,
  };

  const result = await getInvitationsCollection().insertOne(guestDocument);
  return { ...guestDocument, _id: result.insertedId };
};

// Get all invitation guests for a user
const getInvitationGuestsByUserId = async (userId) => {
  return getInvitationsCollection()
    .find({ userId: new ObjectId(userId), type: "guest_invitation" })
    .toArray();
};

// Get invitation guest by ID
const getInvitationGuestById = async (id, userId) => {
  if (!ObjectId.isValid(id)) return null;
  return getInvitationsCollection().findOne({
    _id: new ObjectId(id),
    userId: new ObjectId(userId),
    type: "guest_invitation",
  });
};

// Get guest by tracking token (public)
const getInvitationGuestByToken = async (token) => {
  return getInvitationsCollection().findOne({ trackingToken: token });
};

// Update RSVP (public)
const updateInvitationGuestRSVP = async (token, rsvpData) => {
  const result = await getInvitationsCollection().findOneAndUpdate(
    { trackingToken: token },
    {
      $set: {
        rsvpStatus: rsvpData.rsvpStatus,
        rsvpData: {
          guestCount: rsvpData.guestCount,
          dietaryRestrictions: rsvpData.dietaryRestrictions,
          notes: rsvpData.notes,
          responseDate: new Date(),
        },
        status: "responded",
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );
  return result;
};

// Send invitations (generate tracking links)
const sendInvitationLinks = async (
  guestIds,
  userId,
  invitationDetails,
  baseUrl,
) => {
  const updatedGuests = [];

  console.log("🔗 Generating invitation links with base URL:", baseUrl);

  for (const guestId of guestIds) {
    const token = generateTrackingToken();
    // Ensure no double slashes
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    const invitationLink = `${cleanBaseUrl}/rsvp.html?token=${token}`;

    console.log(`📨 Generated link for guest ${guestId}: ${invitationLink}`);

    const result = await getInvitationsCollection().findOneAndUpdate(
      { _id: new ObjectId(guestId), userId: new ObjectId(userId) },
      {
        $set: {
          trackingToken: token,
          invitationLink: invitationLink,
          status: "sent",
          invitationDetails: invitationDetails,
          sentAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );
    updatedGuests.push(result);
  }

  return updatedGuests;
};

// Delete invitation guest
const deleteInvitationGuest = async (id, userId) => {
  if (!ObjectId.isValid(id)) return null;
  return getInvitationsCollection().deleteOne({
    _id: new ObjectId(id),
    userId: new ObjectId(userId),
    type: "guest_invitation",
  });
};

// Delete all invitation guests for a user
const deleteAllInvitationGuests = async (userId) => {
  return getInvitationsCollection().deleteMany({
    userId: new ObjectId(userId),
    type: "guest_invitation",
  });
};

// Bulk create invitation guests
const bulkCreateInvitationGuests = async (guestsArray, userId) => {
  const now = new Date();
  const guestDocuments = guestsArray.map((guest) => ({
    name: guest.name,
    email: guest.email,
    phone: guest.phone || "",
    guestCount: guest.guestCount || 1,
    dietaryRestrictions: guest.dietaryRestrictions || "",
    userId: new ObjectId(userId),
    trackingToken: null,
    invitationLink: null,
    status: "pending",
    rsvpStatus: "pending",
    rsvpData: null,
    type: "guest_invitation",
    createdAt: now,
    updatedAt: now,
  }));

  console.log(
    `Saving ${guestDocuments.length} invitation guests to invitations collection`,
  );
  const result = await getInvitationsCollection().insertMany(guestDocuments);
  console.log("Insert result:", result);
  return result;
};

// Get RSVP statistics for invitation guests
const getInvitationRSVPStats = async (userId) => {
  const guests = await getInvitationGuestsByUserId(userId);

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
  createInvitationGuest,
  getInvitationGuestsByUserId,
  getInvitationGuestById,
  getInvitationGuestByToken,
  updateInvitationGuestRSVP,
  sendInvitationLinks,
  deleteInvitationGuest,
  deleteAllInvitationGuests,
  bulkCreateInvitationGuests,
  getInvitationRSVPStats,
};
