export interface LoginPreset {
  id: string;
  name: string;
  email: string;
  password: string;
  roleLabel: string;
  classification: "Command" | "Logistics" | "Admin";
}

export const LOGIN_PRESETS: LoginPreset[] = [
  {
    id: "commander",
    name: "Col. Reeves",
    email: "alexander.reeves@military.gov",
    password: "password123",
    roleLabel: "Commander Preset (Col. Reeves)",
    classification: "Command",
  },
  {
    id: "logistics",
    name: "Maj. Chen",
    email: "wei.chen@military.gov",
    password: "password123",
    roleLabel: "Logistics Preset (Maj. Chen)",
    classification: "Logistics",
  },
  {
    id: "admin",
    name: "System Admin",
    email: "admin@military.gov",
    password: "Admin@123456",
    roleLabel: "System Admin (Root Credentials)",
    classification: "Admin",
  },
];
