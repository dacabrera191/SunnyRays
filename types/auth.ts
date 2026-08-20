export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginParent {
  id: number;
  name: string;
  email: string;
}

export interface KidPayload {
  name: string;
  age: string | number;
  swimLevel: string;
}

export interface SignupPayload {
  parentName: string;
  email: string;
  phone: string;
  poolLocation: string;
  password: string;
  kids: KidPayload[];
}
