import { useEffect, useState } from "react";
import { getCachedProfile, loadProfile } from "../controllers/profileController";

// true only for the business admin
export const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(Boolean(getCachedProfile()?.isAdmin));

  useEffect(() => {
    let active = true;
    loadProfile()
      .then((p) => {
        if (active) setIsAdmin(Boolean(p.isAdmin));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return isAdmin;
};