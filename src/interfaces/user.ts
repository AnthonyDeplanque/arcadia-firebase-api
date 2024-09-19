export interface User {
  username: string;
  nom: string;
  prenom: string;
  role_id: number;
}

export interface UserRequest extends Partial<User> {
  password: string;
}

export interface UserInsertion extends Partial<User> {
  hashed_password: string;
}

export interface UserResponse extends User {
  id: string;
  hashed_password: string;
}

// ROLES : 0 admin, 1 veterinaire 2 employe

export enum ROLES {
  "ADMIN",
  "VETERINAIRE",
  "EMPLOYE",
}
