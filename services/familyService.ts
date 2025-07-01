import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/constants/firebase';
import {
  Family,
  FamilyMember,
  FamilyInvitation,
  FamilyRelation,
} from '@/types/family';

export class FamilyService {
  // Create a new family
  static async createFamily(
    creatorId: string,
    creatorName: string,
    creatorEmail: string,
    familyName: string
  ): Promise<string> {
    try {
      const familyId = doc(collection(db, 'families')).id;
      const now = new Date().toISOString();

      const familyData: Family = {
        id: familyId,
        name: familyName,
        createdBy: creatorId,
        members: [
          {
            addedBy: creatorId,
            userId: creatorId,
            firstName: creatorName.split(' ')[0],
            lastName: creatorName.split(' ').slice(1).join(' '),
            email: creatorEmail,
            relation: 'self' as FamilyRelation,
            addedAt: now,
            status: 'accepted',
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      const batch = writeBatch(db);

      // Create family document
      batch.set(doc(db, 'families', familyId), familyData);

      // Update user's familyId
      batch.update(doc(db, 'users', creatorId), {
        familyId: familyId,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      return familyId;
    } catch (error) {
      console.error('Error creating family:', error);
      throw new Error('Failed to create family');
    }
  }

  // Get family by ID
  static async getFamilyById(familyId: string): Promise<Family | null> {
    try {
      const familyDoc = await getDoc(doc(db, 'families', familyId));
      if (familyDoc.exists()) {
        return familyDoc.data() as Family;
      }
      return null;
    } catch (error) {
      console.error('Error getting family:', error);
      throw new Error('Failed to get family data');
    }
  }

  // Find user by identifier (email, phone, or name)
  static async findUserByIdentifier(identifier: string): Promise<any | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'patient'));
      const snapshot = await getDocs(q);

      const targetUser = snapshot.docs.find((doc) => {
        const data = doc.data();
        return (
          data.email === identifier ||
          data.phoneNumber === identifier ||
          doc.id === identifier ||
          `${data.firstName} ${data.lastName}`
            .toLowerCase()
            .includes(identifier.toLowerCase())
        );
      });

      if (targetUser) {
        return { id: targetUser.id, ...targetUser.data() };
      }
      return null;
    } catch (error) {
      console.error('Error finding user:', error);
      throw new Error('Failed to find user');
    }
  }

  // Invite a family member
  static async inviteFamilyMember(
    familyId: string,
    familyName: string,
    inviterId: string,
    inviterName: string,
    memberIdentifier: string,
    relation: FamilyRelation
  ): Promise<void> {
    try {
      // Find target user
      const targetUser = await this.findUserByIdentifier(memberIdentifier);

      if (!targetUser) {
        throw new Error('User not found with the provided information');
      }

      // Check if user is already in a family
      if (targetUser.familyId) {
        throw new Error('User is already part of a family');
      }

      // Check if invitation already exists
      const invitationsRef = collection(db, 'family_invitations');
      const existingInvitation = query(
        invitationsRef,
        where('familyId', '==', familyId),
        where('invitedUserId', '==', targetUser.id),
        where('status', '==', 'pending')
      );

      const existingSnapshot = await getDocs(existingInvitation);
      if (!existingSnapshot.empty) {
        throw new Error('Invitation already sent to this user');
      }

      // Create invitation
      const invitationId = doc(collection(db, 'family_invitations')).id;
      const now = new Date().toISOString();
      const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(); // 7 days

      const invitationData: FamilyInvitation = {
        id: invitationId,
        familyId,
        familyName,
        invitedUserId: targetUser.id,
        invitedBy: inviterId,
        invitedByName: inviterName,
        relation,
        status: 'pending',
        createdAt: now,
        expiresAt: expiresAt,
      };

      await setDoc(doc(db, 'family_invitations', invitationId), invitationData);
    } catch (error) {
      console.error('Error inviting family member:', error);
      throw error;
    }
  }

  // Get user's pending invitations
  static async getUserInvitations(userId: string): Promise<FamilyInvitation[]> {
    try {
      const invitationsRef = collection(db, 'family_invitations');
      const q = query(
        invitationsRef,
        where('invitedUserId', '==', userId),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as FamilyInvitation);
    } catch (error) {
      console.error('Error getting user invitations:', error);
      throw new Error('Failed to get invitations');
    }
  }

  // Accept family invitation
  static async acceptFamilyInvitation(
    invitationId: string,
    userId: string,
    userName: string,
    userEmail: string
  ): Promise<void> {
    try {
      const invitationDoc = await getDoc(
        doc(db, 'family_invitations', invitationId)
      );

      if (!invitationDoc.exists()) {
        throw new Error('Invitation not found');
      }

      const invitation = invitationDoc.data() as FamilyInvitation;

      if (invitation.status !== 'pending') {
        throw new Error('Invitation is no longer valid');
      }

      if (new Date(invitation.expiresAt) < new Date()) {
        throw new Error('Invitation has expired');
      }

      const batch = writeBatch(db);
      const now = new Date().toISOString();

      // Add user to family
      const newMember: FamilyMember = {
        userId,
        firstName: userName.split(' ')[0],
        lastName: userName.split(' ').slice(1).join(' '),
        email: userEmail,
        relation: invitation.relation,
        addedAt: now,
        status: 'accepted',
        addedBy: invitation.invitedBy,
      };

      batch.update(doc(db, 'families', invitation.familyId), {
        members: arrayUnion(newMember),
        updatedAt: serverTimestamp(),
      });

      // Update user's familyId
      batch.update(doc(db, 'users', userId), {
        familyId: invitation.familyId,
        updatedAt: serverTimestamp(),
      });

      // Update invitation status
      batch.update(doc(db, 'family_invitations', invitationId), {
        status: 'accepted',
        acceptedAt: serverTimestamp(),
      });

      await batch.commit();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  // Decline family invitation
  static async declineFamilyInvitation(invitationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'family_invitations', invitationId), {
        status: 'declined',
        declinedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error declining invitation:', error);
      throw new Error('Failed to decline invitation');
    }
  }

  // Kick family member (only by family owner)
  static async kickFamilyMember(
    familyId: string,
    memberId: string,
    ownerId: string
  ): Promise<void> {
    try {
      const familyDoc = await getDoc(doc(db, 'families', familyId));

      if (!familyDoc.exists()) {
        throw new Error('Family not found');
      }

      const family = familyDoc.data() as Family;

      // Verify that the requester is the family owner
      if (family.createdBy !== ownerId) {
        throw new Error('Only the family owner can remove members');
      }

      // Prevent owner from kicking themselves
      if (memberId === ownerId) {
        throw new Error('Family owner cannot remove themselves');
      }

      const memberToRemove = family.members.find((m) => m.userId === memberId);

      if (!memberToRemove) {
        throw new Error('Member not found in family');
      }

      const batch = writeBatch(db);

      // Remove member from family
      batch.update(doc(db, 'families', familyId), {
        members: arrayRemove(memberToRemove),
        updatedAt: serverTimestamp(),
      });

      // Remove familyId from user
      batch.update(doc(db, 'users', memberId), {
        familyId: '',
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    } catch (error) {
      console.error('Error kicking family member:', error);
      throw error;
    }
  }

  // Remove family member (deprecated - use kickFamilyMember instead)
  static async removeFamilyMember(
    familyId: string,
    memberId: string
  ): Promise<void> {
    try {
      const familyDoc = await getDoc(doc(db, 'families', familyId));

      if (!familyDoc.exists()) {
        throw new Error('Family not found');
      }

      const family = familyDoc.data() as Family;
      const memberToRemove = family.members.find((m) => m.userId === memberId);

      if (!memberToRemove) {
        throw new Error('Member not found in family');
      }

      const batch = writeBatch(db);

      // Remove member from family
      batch.update(doc(db, 'families', familyId), {
        members: arrayRemove(memberToRemove),
        updatedAt: serverTimestamp(),
      });

      // Remove familyId from user
      batch.update(doc(db, 'users', memberId), {
        familyId: '',
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    } catch (error) {
      console.error('Error removing family member:', error);
      throw error;
    }
  }

  // Leave family
  static async leaveFamily(familyId: string, userId: string): Promise<void> {
    try {
      const familyDoc = await getDoc(doc(db, 'families', familyId));

      if (!familyDoc.exists()) {
        throw new Error('Family not found');
      }

      const family = familyDoc.data() as Family;
      const memberToRemove = family.members.find((m) => m.userId === userId);

      if (!memberToRemove) {
        throw new Error('You are not a member of this family');
      }

      const batch = writeBatch(db);

      // If this is the family creator and there are other members, transfer ownership
      if (family.createdBy === userId && family.members.length > 1) {
        const newOwner = family.members.find((m) => m.userId !== userId);
        if (newOwner) {
          batch.update(doc(db, 'families', familyId), {
            createdBy: newOwner.userId,
            members: arrayRemove(memberToRemove),
            updatedAt: serverTimestamp(),
          });
        }
      } else if (family.members.length === 1) {
        // If this is the only member, delete the family
        batch.delete(doc(db, 'families', familyId));
      } else {
        // Just remove the member
        batch.update(doc(db, 'families', familyId), {
          members: arrayRemove(memberToRemove),
          updatedAt: serverTimestamp(),
        });
      }

      // Remove familyId from user
      batch.update(doc(db, 'users', userId), {
        familyId: '',
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    } catch (error) {
      console.error('Error leaving family:', error);
      throw error;
    }
  }

  // Add child user to family after Firebase authentication (used with AuthContext.createChildAccount)
  static async addChildToFamily(
    familyId: string,
    childUserId: string,
    childData: {
      firstName: string;
      lastName: string;
      email: string;
    },
    relation: FamilyRelation,
    parentId: string
  ): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // Add child to family members
      const newMember: FamilyMember = {
        userId: childUserId,
        firstName: childData.firstName,
        lastName: childData.lastName,
        email: childData.email,
        relation: relation,
        addedAt: now,
        status: 'accepted',
        addedBy: parentId,
      };

      await updateDoc(doc(db, 'families', familyId), {
        members: arrayUnion(newMember),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding child to family:', error);
      throw new Error('Failed to add child to family');
    }
  }

  // Create child account and add to family directly (DEPRECATED - use AuthContext.createChildAccount instead)
  static async createChildFamilyMember(
    familyId: string,
    parentId: string,
    parentName: string,
    childData: {
      firstName: string;
      middleName: string;
      lastName: string;
      phoneNumber: string;
      dateOfBirth: string;
      address: string;
      gender: string;
    },
    relation: FamilyRelation
  ): Promise<string> {
    try {
      // This method is deprecated - use AuthContext.createChildAccount followed by addChildToFamily
      throw new Error('This method is deprecated. Please use AuthContext.createChildAccount followed by FamilyService.addChildToFamily');
    } catch (error) {
      console.error('Error creating child family member:', error);
      throw new Error('This method is deprecated. Please use AuthContext.createChildAccount followed by FamilyService.addChildToFamily');
    }
  }

  // Get family member's medical records (basic info only for privacy)
  static async getFamilyMemberRecords(
    memberId: string,
    requesterId: string
  ): Promise<any[]> {
    try {
      // First verify that both users are in the same family
      const requesterDoc = await getDoc(doc(db, 'users', requesterId));
      const memberDoc = await getDoc(doc(db, 'users', memberId));

      if (!requesterDoc.exists() || !memberDoc.exists()) {
        throw new Error('User not found');
      }

      const requesterData = requesterDoc.data();
      const memberData = memberDoc.data();

      if (
        !requesterData.familyId ||
        requesterData.familyId !== memberData.familyId
      ) {
        throw new Error('Not authorized to view these records');
      }

      // Get basic medical records (you can customize what data to share)
      const recordsQuery = query(
        collection(db, 'medical_records'),
        where('patientId', '==', memberId)
      );

      const snapshot = await getDocs(recordsQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Remove sensitive details for family viewing
        description: 'Medical record available',
        diagnosis: '[Private]',
        treatment: '[Private]',
      }));
    } catch (error) {
      console.error('Error fetching family member records:', error);
      throw new Error('Failed to fetch medical records');
    }
  }
}