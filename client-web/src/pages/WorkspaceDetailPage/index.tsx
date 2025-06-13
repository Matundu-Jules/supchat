import React from "react";
import { useParams } from "react-router-dom";

const WorkspaceDetailPage: React.FC = () => {
  const { id } = useParams();
  return <h1>Détail de l'espace de travail {id}</h1>;
};

export default WorkspaceDetailPage;
