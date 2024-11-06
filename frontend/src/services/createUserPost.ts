import { config } from "../config";

export const createUserPost = async (
    email:string,
    username:string,
    password:string,
    firstName:string,
    lastName:string,
): Promise<boolean> => {
  const response = await fetch(`${config.mediaAuthApiUrl}/videos/upload-start`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'credentials': 'include'
    },
    body: JSON.stringify({
      email,
      username,
      password,
      firstName,
      lastName,
    }),
    credentials: 'include'
  });
  if (!response.ok) {
    return false;
  }
  return true;
};
