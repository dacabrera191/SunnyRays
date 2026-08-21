export interface StaffPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "instructor" | "admin";
}
