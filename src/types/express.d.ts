// Extend Express Request globally to include `user` (auth payload).
// Avoid importing application types here to prevent circular type references.
// Safely augment Express' Request type without imports to avoid circular type references.
export {};

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
