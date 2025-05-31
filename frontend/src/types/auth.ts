// Types for Authentication related data structures

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    // Add other fields if needed, e.g., name
    // name: string;
} 