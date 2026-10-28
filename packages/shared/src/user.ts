export const PHONE_PATTERN = "^[0-9+()\\-\\s]{6,32}$";

export interface MeResponse {
  id: string;
  name: string;
  email: string;
  image: string | null;
  phone: string;
}

export interface UpdateMeBody {
  name?: string;
  image?: string | null;
  phone?: string;
}
