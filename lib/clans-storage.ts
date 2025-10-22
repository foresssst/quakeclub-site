import fs from "fs"
import path from "path"
import { safeJsonParse } from "./security"

export interface Clan {
  id: string
  name: string
  tag: string // Clan tag (ej: [QC], {BR}, etc)
  logoUrl?: string
  leaderId: string // User ID del líder
  memberIds: string[] // Array de user IDs
  createdAt: number
}

export interface ClanInvitation {
  id: string
  clanId: string
  clanName: string
  fromUserId: string
  fromUsername: string
  toUserId: string
  toUsername: string
  status: "pending" | "accepted" | "rejected"
  createdAt: number
}

export interface ClanJoinRequest {
  id: string
  clanId: string
  clanName: string
  fromUserId: string
  fromUsername: string
  status: "pending" | "accepted" | "rejected"
  createdAt: number
}

const DATA_DIR = path.join(process.cwd(), "data")
const CLANS_FILE = path.join(DATA_DIR, "clans.json")
const INVITATIONS_FILE = path.join(DATA_DIR, "clan-invitations.json")
const JOIN_REQUESTS_FILE = path.join(DATA_DIR, "clan-join-requests.json")

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Load clans from file
function loadClans(): Map<string, Clan> {
  try {
    if (fs.existsSync(CLANS_FILE)) {
      const data = fs.readFileSync(CLANS_FILE, "utf-8")
      const clansArray = safeJsonParse<Array<[string, Clan]>>(data, [])
      return new Map(clansArray)
    }
  } catch (error) {
    console.error("Error loading clans:", error)
  }
  return new Map()
}

// Save clans to file
function saveClans(clans: Map<string, Clan>) {
  try {
    const clansArray = Array.from(clans.entries())
    fs.writeFileSync(CLANS_FILE, JSON.stringify(clansArray, null, 2))
  } catch (error) {
    console.error("Error saving clans:", error)
  }
}

// Load invitations from file
function loadInvitations(): Map<string, ClanInvitation> {
  try {
    if (fs.existsSync(INVITATIONS_FILE)) {
      const data = fs.readFileSync(INVITATIONS_FILE, "utf-8")
      const invitationsArray = safeJsonParse<Array<[string, ClanInvitation]>>(data, [])
      return new Map(invitationsArray)
    }
  } catch (error) {
    console.error("Error loading invitations:", error)
  }
  return new Map()
}

// Save invitations to file
function saveInvitations(invitations: Map<string, ClanInvitation>) {
  try {
    const invitationsArray = Array.from(invitations.entries())
    fs.writeFileSync(INVITATIONS_FILE, JSON.stringify(invitationsArray, null, 2))
  } catch (error) {
    console.error("Error saving invitations:", error)
  }
}

// Load join requests from file
function loadJoinRequests(): Map<string, ClanJoinRequest> {
  try {
    if (fs.existsSync(JOIN_REQUESTS_FILE)) {
      const data = fs.readFileSync(JOIN_REQUESTS_FILE, "utf-8")
      const requestsArray = safeJsonParse<Array<[string, ClanJoinRequest]>>(data, [])
      return new Map(requestsArray)
    }
  } catch (error) {
    console.error("Error loading join requests:", error)
  }
  return new Map()
}

// Save join requests to file
function saveJoinRequests(requests: Map<string, ClanJoinRequest>) {
  try {
    const requestsArray = Array.from(requests.entries())
    fs.writeFileSync(JOIN_REQUESTS_FILE, JSON.stringify(requestsArray, null, 2))
  } catch (error) {
    console.error("Error saving join requests:", error)
  }
}

// Create a new clan
export function createClan(name: string, tag: string, leaderId: string, logoUrl?: string): Clan | null {
  const clans = loadClans()

  // Check if user is already in a clan
  for (const clan of clans.values()) {
    if (clan.memberIds.includes(leaderId) || clan.leaderId === leaderId) {
      return null // User already in a clan
    }
  }

  // Check if clan name or tag already exists
  for (const clan of clans.values()) {
    if (clan.name.toLowerCase() === name.toLowerCase() || clan.tag.toLowerCase() === tag.toLowerCase()) {
      return null // Clan name or tag already exists
    }
  }

  const id = `clan-${Date.now()}`
  const newClan: Clan = {
    id,
    name,
    tag,
    leaderId,
    memberIds: [leaderId], // Leader is automatically a member
    createdAt: Date.now(),
    logoUrl,
  }

  clans.set(id, newClan)
  saveClans(clans)
  return newClan
}

// Get all clans
export function getAllClans(): Clan[] {
  const clans = loadClans()
  return Array.from(clans.values())
}

// Get clan by ID
export function getClanById(clanId: string): Clan | null {
  const clans = loadClans()
  return clans.get(clanId) || null
}

// Get clan by user ID
export function getClanByUserId(userId: string): Clan | null {
  const clans = loadClans()
  for (const clan of clans.values()) {
    if (clan.memberIds.includes(userId) || clan.leaderId === userId) {
      return clan
    }
  }
  return null
}

// Create invitation
export function createInvitation(
  clanId: string,
  clanName: string,
  fromUserId: string,
  fromUsername: string,
  toUserId: string,
  toUsername: string,
): ClanInvitation | null {
  const clans = loadClans()
  const clan = clans.get(clanId)

  if (!clan) {
    return null // Clan doesn't exist
  }

  // Check if user is already in a clan
  if (getClanByUserId(toUserId)) {
    return null // User already in a clan
  }

  // Check if invitation already exists
  const invitations = loadInvitations()
  for (const invitation of invitations.values()) {
    if (invitation.toUserId === toUserId && invitation.status === "pending") {
      return null // User already has a pending invitation
    }
  }

  const id = `inv-${Date.now()}`
  const newInvitation: ClanInvitation = {
    id,
    clanId,
    clanName,
    fromUserId,
    fromUsername,
    toUserId,
    toUsername,
    status: "pending",
    createdAt: Date.now(),
  }

  invitations.set(id, newInvitation)
  saveInvitations(invitations)
  return newInvitation
}

// Get invitations for a user
export function getInvitationsForUser(userId: string): ClanInvitation[] {
  const invitations = loadInvitations()
  return Array.from(invitations.values()).filter((inv) => inv.toUserId === userId && inv.status === "pending")
}

// Accept invitation
export function acceptInvitation(invitationId: string, userId: string): boolean {
  const invitations = loadInvitations()
  const invitation = invitations.get(invitationId)

  if (!invitation || invitation.toUserId !== userId || invitation.status !== "pending") {
    return false
  }

  // Check if user is already in a clan
  if (getClanByUserId(userId)) {
    return false
  }

  const clans = loadClans()
  const clan = clans.get(invitation.clanId)

  if (!clan) {
    return false
  }

  // Add user to clan
  clan.memberIds.push(userId)
  clans.set(clan.id, clan)
  saveClans(clans)

  // Update invitation status
  invitation.status = "accepted"
  invitations.set(invitationId, invitation)
  saveInvitations(invitations)

  return true
}

// Reject invitation
export function rejectInvitation(invitationId: string, userId: string): boolean {
  const invitations = loadInvitations()
  const invitation = invitations.get(invitationId)

  if (!invitation || invitation.toUserId !== userId || invitation.status !== "pending") {
    return false
  }

  invitation.status = "rejected"
  invitations.set(invitationId, invitation)
  saveInvitations(invitations)

  return true
}

// Create join request
export function createJoinRequest(
  clanId: string,
  clanName: string,
  fromUserId: string,
  fromUsername: string,
): ClanJoinRequest | null {
  const clans = loadClans()
  const clan = clans.get(clanId)

  if (!clan) {
    return null // Clan doesn't exist
  }

  // Check if user is already in a clan
  if (getClanByUserId(fromUserId)) {
    return null // User already in a clan
  }

  // Check if join request already exists
  const requests = loadJoinRequests()
  for (const request of requests.values()) {
    if (request.fromUserId === fromUserId && request.clanId === clanId && request.status === "pending") {
      return null // User already has a pending request for this clan
    }
  }

  const id = `join-req-${Date.now()}`
  const newRequest: ClanJoinRequest = {
    id,
    clanId,
    clanName,
    fromUserId,
    fromUsername,
    status: "pending",
    createdAt: Date.now(),
  }

  requests.set(id, newRequest)
  saveJoinRequests(requests)
  return newRequest
}

// Get join requests for a clan (for the leader)
export function getJoinRequestsForClan(clanId: string): ClanJoinRequest[] {
  const requests = loadJoinRequests()
  return Array.from(requests.values()).filter((req) => req.clanId === clanId && req.status === "pending")
}

// Accept join request
export function acceptJoinRequest(requestId: string, leaderId: string): boolean {
  const requests = loadJoinRequests()
  const request = requests.get(requestId)

  if (!request || request.status !== "pending") {
    return false
  }

  const clans = loadClans()
  const clan = clans.get(request.clanId)

  if (!clan || clan.leaderId !== leaderId) {
    return false // Clan doesn't exist or requester is not the leader
  }

  // Check if user is already in a clan
  if (getClanByUserId(request.fromUserId)) {
    return false
  }

  // Add user to clan
  clan.memberIds.push(request.fromUserId)
  clans.set(clan.id, clan)
  saveClans(clans)

  // Update request status
  request.status = "accepted"
  requests.set(requestId, request)
  saveJoinRequests(requests)

  return true
}

// Reject join request
export function rejectJoinRequest(requestId: string, leaderId: string): boolean {
  const requests = loadJoinRequests()
  const request = requests.get(requestId)

  if (!request || request.status !== "pending") {
    return false
  }

  const clans = loadClans()
  const clan = clans.get(request.clanId)

  if (!clan || clan.leaderId !== leaderId) {
    return false
  }

  request.status = "rejected"
  requests.set(requestId, request)
  saveJoinRequests(requests)

  return true
}

// Remove member from clan (only leader can do this)
export function removeMemberFromClan(clanId: string, memberId: string, requesterId: string): boolean {
  const clans = loadClans()
  const clan = clans.get(clanId)

  if (!clan || clan.leaderId !== requesterId) {
    return false // Clan doesn't exist or requester is not the leader
  }

  if (memberId === clan.leaderId) {
    return false // Can't remove the leader
  }

  const memberIndex = clan.memberIds.indexOf(memberId)
  if (memberIndex === -1) {
    return false // Member not in clan
  }

  clan.memberIds.splice(memberIndex, 1)
  clans.set(clanId, clan)
  saveClans(clans)

  return true
}

// Leave clan (member leaves voluntarily)
export function leaveClan(clanId: string, userId: string): boolean {
  const clans = loadClans()
  const clan = clans.get(clanId)

  if (!clan) {
    return false
  }

  if (userId === clan.leaderId) {
    return false // Leader can't leave, must transfer leadership or disband
  }

  const memberIndex = clan.memberIds.indexOf(userId)
  if (memberIndex === -1) {
    return false
  }

  clan.memberIds.splice(memberIndex, 1)
  clans.set(clanId, clan)
  saveClans(clans)

  return true
}

// Delete clan (only leader can do this)
export function deleteClan(clanId: string, requesterId: string): boolean {
  const clans = loadClans()
  const clan = clans.get(clanId)

  if (!clan || clan.leaderId !== requesterId) {
    return false
  }

  clans.delete(clanId)
  saveClans(clans)

  // Delete all pending invitations for this clan
  const invitations = loadInvitations()
  for (const [id, invitation] of invitations.entries()) {
    if (invitation.clanId === clanId && invitation.status === "pending") {
      invitations.delete(id)
    }
  }
  saveInvitations(invitations)

  return true
}

// Update clan avatar
export function updateClanAvatar(clanId: string, leaderId: string, logoUrl: string): boolean {
  const clans = loadClans()
  const clan = clans.get(clanId)

  if (!clan || clan.leaderId !== leaderId) {
    return false // Clan doesn't exist or requester is not the leader
  }

  clan.logoUrl = logoUrl
  clans.set(clanId, clan)
  saveClans(clans)

  return true
}
