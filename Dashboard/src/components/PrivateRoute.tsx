import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { verifyToken } from "@/services/authService";

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const valid = true;
      setAuthorized(valid);
    };
    check();
  }, []);

  if (authorized === null) {
    return <div className="text-center mt-10">Verificando sessão...</div>;
  }

  if (!authorized) {
    return <Navigate to="/" replace />;
  }

  return children;
};
