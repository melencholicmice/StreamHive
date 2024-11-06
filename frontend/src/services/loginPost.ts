import { config } from "../config";

type LoginStatus = {
  success: boolean;
  message: string;
};

type LoginResponse = {
  message: string;
};

export const loginPost = async (email: string, password:string): Promise<LoginStatus> => {
  let response = await fetch(`${config.mediaAuthApiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
    }),
    credentials: 'include'
  });

  const responseData: LoginResponse = await response.json();
  
  if (!response.ok || response.status !== 200) {
    return {
      success: false,
      message: responseData.message,
    };
  }

  return {
    success: true,
    message: responseData.message,
  };
};