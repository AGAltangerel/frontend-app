// utils/jwt.js
import jwtDecode from 'jwt-decode';

export function decodeToken(token) {
  try {
    console.log("Decoding token:", token)
    return jwtDecode(token);
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}
