import { auth } from './firebaseService';
import { 
  signInWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
} from 'firebase/auth';

const BIOMETRIC_STORAGE_KEY = 'edgelearn-biometric-auth';

/**
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!
 * !!! SECURITY WARNING !!!
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!
 * The following functions store user credentials in localStorage. This is a MAJOR security risk and is
 * done PURELY FOR DEMONSTRATION PURPOSES to simulate a passwordless experience in a serverless,
 * front-end-only context.
 *
 * In a REAL-WORLD application, you should NEVER store plain text passwords. Instead, you would use a
 * secure backend with a proper WebAuthn (FIDO2) implementation to handle challenges and credential
 * verification, which is beyond the scope of this frontend-only simulation.
 */

// Function to check if biometrics have been "enabled" for this device
export const hasBiometricCredentials = (): boolean => {
    return localStorage.getItem(BIOMETRIC_STORAGE_KEY) !== null;
};

// Function to "enable" biometric sign-in
export const enableBiometrics = async (password: string): Promise<{ success: boolean; message: string }> => {
    const user = auth.currentUser;
    if (!user || !user.email) {
        return { success: false, message: 'No user is currently signed in.' };
    }

    try {
        // Step 1: Re-authenticate the user to verify their identity before enabling a new auth method.
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);

        // Step 2: Store credentials in localStorage (FOR DEMO ONLY).
        const credentialsToStore = JSON.stringify({ email: user.email, password: password });
        localStorage.setItem(BIOMETRIC_STORAGE_KEY, credentialsToStore);

        return { success: true, message: 'Biometric sign-in enabled!' };
    } catch (error: any) {
        console.error("Biometric setup failed:", error);
        if (error.code === 'auth/wrong-password') {
            return { success: false, message: 'Incorrect password. Please try again.' };
        }
        return { success: false, message: 'An error occurred during setup.' };
    }
};

// Function to disable biometric sign-in
export const disableBiometrics = () => {
    localStorage.removeItem(BIOMETRIC_STORAGE_KEY);
};

// Function to perform the simulated biometric sign-in
export const signInWithBiometrics = async (): Promise<User> => {
    const storedCredentials = localStorage.getItem(BIOMETRIC_STORAGE_KEY);
    if (!storedCredentials) {
        throw new Error('No biometric credentials found on this device.');
    }

    try {
        // Simulate a biometric prompt. In a real app, this is where you'd use navigator.credentials.get().
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        const confirmed = window.confirm("Simulating biometric scan (e.g., fingerprint, face ID). Press OK to continue.");
        
        if (!confirmed) {
            throw new Error('Biometric authentication cancelled by user.');
        }

        const { email, password } = JSON.parse(storedCredentials);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
        
    } catch (error) {
        console.error("Biometric sign-in failed:", error);
        // If stored credentials fail, it's good practice to clear them.
        disableBiometrics();
        throw new Error('Biometric sign-in failed. Please sign in manually to re-enable it.');
    }
};