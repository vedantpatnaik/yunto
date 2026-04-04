import { Role } from "../constants/roles";

export interface LoginRequest {
  email: string;
  password: string;
  agencyCode: string;
}

export interface OtpSendRequest {
  phone: string;
}

export interface OtpVerifyRequest {
  phone: string;
  code: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDTO;
}

export interface UserDTO {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  avatar: string | null;
  role: Role;
  department: string | null;
  agency: AgencyDTO;
}

export interface AgencyDTO {
  id: string;
  name: string;
  code: string;
  logo: string | null;
}

export interface TokenPayload {
  userId: string;
  agencyId: string;
  role: Role;
}
