import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const SALT_ROUNDS = 12;
// Used in login when user is not found — keeps response time consistent to prevent user enumeration
const DUMMY_HASH = '$2b$12$invalidhashtopreventtimingattacks000000000000000000000';

const regenerateSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.regenerate((err) => (err ? reject(err) : resolve()));
  });

const destroySession = (req) =>
  new Promise((resolve, reject) => {
    req.session.destroy((err) => (err ? reject(err) : resolve()));
  });

export const resolvers = {
  Query: {
    currentUser: async (_, __, { req }) => {
      if (!req.session?.userId) return null;
      try {
        const user = await User.findById(req.session.userId);
        return user ?? null;
      } catch {
        return null;
      }
    }
  },

  Mutation: {
    register: async (_, { username, email, password }, { req }) => {
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const normalizedEmail = email.toLowerCase().trim();
      const [existingEmail, existingUsername] = await Promise.all([
        User.findOne({ email: normalizedEmail }),
        User.findOne({ username: username.trim() })
      ]);
      if (existingEmail) throw new Error('Email is already registered');
      if (existingUsername) throw new Error('Username is already taken');

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const user = await User.create({
        username: username.trim(),
        email: normalizedEmail,
        password: hashedPassword
      });

      await regenerateSession(req);
      req.session.userId = user._id.toString();

      return {
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role
        },
        message: 'Registration successful'
      };
    },

    login: async (_, { email, password }, { req }) => {
      const normalizedEmail = email.toLowerCase().trim();
      // .select('+password') required — password field has select: false in the model
      const user = await User.findOne({ email: normalizedEmail }).select('+password');

      if (!user) {
        await bcrypt.compare(password, DUMMY_HASH);
        throw new Error('Invalid email or password');
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error('Invalid email or password');

      await regenerateSession(req);
      req.session.userId = user._id.toString();

      return {
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role
        },
        message: 'Login successful'
      };
    },

    logout: async (_, __, { req, res }) => {
      await destroySession(req);
      res.clearCookie('devpilot.sid');
      return { message: 'Logged out successfully' };
    }
  },

  User: {
    __resolveReference: async (reference) => {
      try {
        return await User.findById(reference.id);
      } catch {
        return null;
      }
    }
  }
};
