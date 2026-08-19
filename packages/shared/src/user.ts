export interface MeResponse {
  id: string;
  name: string;
  email: string;
  image: string | null;
  phone: string;
}

export interface UpdateMeBody {
  name?: string;
  image?: string;
  phone?: string;
}
