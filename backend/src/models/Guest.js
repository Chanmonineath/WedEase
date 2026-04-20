// backend/src/models/Guest.js
const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/db");
const crypto = require("crypto");

const collectionName = "guests";

const getGuestsCollection = () => getDatabase().collection(collectionName);

// Generate unique tracking token
const generateTrackingToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Create a guest
const createGuest = async (guestData) => {
  const now = new Date();
  const guestDocument = {
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
    rsvpData: null,
    createdAt: now,
    updatedAt: now,
  };

  const result = await getGuestsCollection().insertOne(guestDocument);
  return { ...guestDocument, _id: result.insertedId };
};

// Get all guests for a user
const getGuestsByUserId = async (userId) => {
  return getGuestsCollection()
    .find({ userId: new ObjectId(userId) })
    .toArray();
};

// Get guest by ID
const getGuestById = async (id, userId) => {
  if (!ObjectId.isValid(id)) return null;
  return getGuestsCollection().findOne({ 
    _id: new ObjectId(id), 
    userId: new ObjectId(userId) 
  });
};

// Get guest by tracking token (public)
const getGuestByToken = async (token) => {
  return getGuestsCollection().findOne({ trackingToken: token });
};

// Update guest
const updateGuest = async (id, userId, updateData) => {
  if (!ObjectId.isValid(id)) return null;
  
  const result = await getGuestsCollection().findOneAndUpdate(
    { _id: new ObjectId(id), userId: new ObjectId(userId) },
    { $set: { ...updateData, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  return result;
};

// Update RSVP (public)
const updateRSVP = async (token, rsvpData) => {
  const result = await getGuestsCollection().findOneAndUpdate(
    { trackingToken: token },
    { 
      $set: { 
        rsvpStatus: rsvpData.rsvpStatus,
        rsvpData: {
          guestCount: rsvpData.guestCount,
          dietaryRestrictions: rsvpData.dietaryRestrictions,
          notes: rsvpData.notes,
          responseDate: new Date()
        },
        status: "responded",
        updatedAt: new Date()
      }
    },
    { returnDocument: 'after' }
  );
  return result;
};

// Send invitations
const sendInvitations = async (guestIds, userId, invitationDetails, baseUrl) => {
  const updatedGuests = [];
  
  for (const guestId of guestIds) {
    const token = generateTrackingToken();
    const invitationLink = `${baseUrl}/rsvp.html?token=${token}`;
    
    const result = await getGuestsCollection().findOneAndUpdate(
      { _id: new ObjectId(guestId), userId: new ObjectId(userId) },
      { 
        $set: { 
          trackingToken: token,
          invitationLink: invitationLink,
          status: "sent",
          invitationDetails: invitationDetails,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    updatedGuests.push(result);
  }
  
  return updatedGuests;
};

// Delete guest
const deleteGuest = async (id, userId) => {
  if (!ObjectId.isValid(id)) return null;
  return getGuestsCollection().deleteOne({ 
    _id: new ObjectId(id), 
    userId: new ObjectId(userId) 
  });
};

// Delete all guests for a user
const deleteAllGuests = async (userId) => {
  return getGuestsCollection().deleteMany({ userId: new ObjectId(userId) });
};

// Bulk create guests
const bulkCreateGuests = async (guestsArray, userId) => {
  const now = new Date();
  const guestDocuments = guestsArray.map(guest => ({
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
    createdAt: now,
    updatedAt: now,
  }));
  
  const result = await getGuestsCollection().insertMany(guestDocuments);
  return result;
};

// Get RSVP statistics
const getRSVPStats = async (userId) => {
  const guests = await getGuestsByUserId(userId);
  
  return {
    total: guests.length,
    sent: guests.filter(g => g.status === "sent").length,
    responded: guests.filter(g => g.rsvpStatus === "confirmed").length,
    pending: guests.filter(g => g.status === "sent" && g.rsvpStatus === "pending").length,
    declined: guests.filter(g => g.rsvpStatus === "declined").length,
  };
};

module.exports = {
  createGuest,
  getGuestsByUserId,
  getGuestById,
  getGuestByToken,
  updateGuest,
  updateRSVP,
  sendInvitations,
  deleteGuest,
  deleteAllGuests,
  bulkCreateGuests,
  getRSVPStats,
};
