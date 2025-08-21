import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

admin.initializeApp();

export const createUserDocument = functions.auth.user().onCreate(async (user) => {
  const userId = user.uid;
  const createdAt = admin.firestore.FieldValue.serverTimestamp();

  const userDoc = {
    userId,
    createdAt,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    phoneNumber: user.phoneNumber ?? null,
    photoURL: user.photoURL ?? null,
    providerId: user.providerData ?? null,
    tenantId: user.tenantId ?? null,
    emailVerified: user.emailVerified ?? null
  };

  try {
    await admin.firestore().collection('users').doc(userId).set(userDoc);
    console.log(`User document created for UID: ${userId}`);
  } catch (error) {
    console.error('Error creating user document:', error);
  }
});