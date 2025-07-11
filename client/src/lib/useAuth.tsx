import { useToast } from "@/hooks/use-toast";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  auth,
  convertFirebaseUser,
  createUserDocument,
  googleProvider,
  User as FirebaseUserType
} from "./firebase";

interface MongoUser {
  _id: string;
  email: string;
  username: string;
  displayName: string;
  photoURL: string;
  role: string;
  createdAt: string;
}

interface AuthContextType {
  currentUser: (FirebaseUserType & { mongoUser?: MongoUser | null }) | null;
  loading: boolean;
  signInWithGoogle: () => Promise<FirebaseUserType | null>;
  login: (email: string, password: string) => Promise<FirebaseUserType | null>;
  register: (email: string, password: string, username: string) => Promise<FirebaseUserType | null>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<(FirebaseUserType & { mongoUser?: MongoUser | null }) | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Helper to fetch MongoDB user by email
  const fetchMongoUser = async (email: string) => {
    try {
      const res = await fetch(`/api/users/email/${encodeURIComponent(email)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = firebaseOnAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        await createUserDocument(firebaseUser);
        const user = await convertFirebaseUser(firebaseUser);
        let mongoUser = null;
        if (user.email) {
          mongoUser = await fetchMongoUser(user.email);
        }
        setCurrentUser({ ...user, mongoUser });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async (): Promise<FirebaseUserType | null> => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      await createUserDocument(result.user);
      const user = await convertFirebaseUser(result.user);
      let mongoUser = null;
      if (user.email) {
        mongoUser = await fetchMongoUser(user.email);
      }
      setCurrentUser({ ...user, mongoUser });
      toast({
        title: "Success!",
        description: "Signed in with Google successfully.",
        variant: "default"
      });
      return user;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        title: "Sign-in Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<FirebaseUserType | null> => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createUserDocument(result.user);
      const user = await convertFirebaseUser(result.user);
      let mongoUser = null;
      if (user.email) {
        mongoUser = await fetchMongoUser(user.email);
      }
      setCurrentUser({ ...user, mongoUser });
      toast({
        title: "Welcome back!",
        description: "Logged in successfully.",
        variant: "default"
      });
      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = "Invalid email or password. Please try again.";
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      }
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string): Promise<FirebaseUserType | null> => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: username });
      await createUserDocument(result.user, { username });
      const user = await convertFirebaseUser(result.user);
      let mongoUser = null;
      if (user.email) {
        mongoUser = await fetchMongoUser(user.email);
      }
      setCurrentUser({ ...user, mongoUser });
      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
        variant: "default"
      });
      return user;
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = "Could not create account. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      }
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
        variant: "default"
      });
      setCurrentUser(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "Could not log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const contextValue: AuthContextType = {
    currentUser,
    loading,
    signInWithGoogle,
    login,
    register,
    logout,
    isAdmin: currentUser?.isAdmin || false
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}