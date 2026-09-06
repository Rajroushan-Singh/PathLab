import { Navigate, useParams } from "react-router-dom";
import { encodePatientRef } from "@/lib/patientRef";

/** Redirects legacy /user/:id URLs to protected /patient/:ref routes. */
const LegacyUserRedirect = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/patients" replace />;
  return <Navigate to={`/patient/${encodePatientRef(id)}`} replace />;
};

export default LegacyUserRedirect;
