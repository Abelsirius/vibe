export interface IRegister {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?:string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl: string | null;
  role: 'User' | 'Admin' | string; // ajusta si hay más roles
  followersCount: number;
  followingCount: number;
  mediaCount: number;
  createdAt: string; // O mejor: Date si haces el parse
}
export interface Content {
  id: number;
  content: string;
  mediaId: number;
  createdAt: string;
  updatedAt: string | null;
  user: {
    id: number;
    username: string;
    avatarUrl: string;
  };
}
export interface IUser {
  id: number;
  username: string;
  role: 'User' | 'Admin'; // Puedes extender si hay más roles
  passwordHash: string;
  firstName: string;
  lastName: string;
  email: string;

  followers: IUser[];  // O `number[]` si solo manejas IDs
  following: IUser[];  // Igual, depende de tu modelo
}

export interface IUserStatus {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isFollowing:boolean,
isOwnProfile:boolean

}
export interface ILogin {
  username: string;
  password: string;
}