// In-memory user store for authentication
// In production, this would be replaced with a proper database

import { createHash, randomBytes } from "crypto"

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
}

export interface Session {
  id: string
  userId: string
  expiresAt: number
}

const users: User[] = []
const sessions: Map<string, Session> = new Map()

function hashPassword(password: string, salt: string): string {
  return createHash("sha256")
    .update(password + salt)
    .digest("hex")
}

function generateSalt(): string {
  return randomBytes(16).toString("hex")
}

export function createUser(name: string, email: string, password: string): User | null {
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (existing) return null

  const salt = generateSalt()
  const passwordHash = hashPassword(password, salt) + ":" + salt

  const user: User = {
    id: randomBytes(16).toString("hex"),
    name,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
  }

  users.push(user)
  return user
}

export function verifyUser(email: string, password: string): User | null {
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!user) return null

  const [hash, salt] = user.passwordHash.split(":")
  const attempt = hashPassword(password, salt)

  if (attempt !== hash) return null
  return user
}

export function createSession(userId: string): string {
  const sessionId = randomBytes(32).toString("hex")
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }
  sessions.set(sessionId, session)
  return sessionId
}

export function getSession(sessionId: string): Session | null {
  const session = sessions.get(sessionId)
  if (!session) return null
  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId)
    return null
  }
  return session
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId)
}

export function getUserById(id: string): User | null {
  return users.find((u) => u.id === id) || null
}
