import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_PROJECTS,
  CREATE_PROJECT,
  CREATE_FEATURE,
  GET_DRAFTS,
  SUBMIT_DRAFT,
  DELETE_PROJECT,
} from "../graphql/features";

const ProjectsPage = () => {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [projectName, setProjectName] = useState("");
  const [featureTitle, setFeatureTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  const { data, refetch } = useQuery(GET_PROJECTS);

  const { data: draftsData, refetch: refetchDrafts } = useQuery(GET_DRAFTS, {
    variables: { featureId: selectedFeature?.id },
    skip: !selectedFeature,
  });

  const [createProject] = useMutation(CREATE_PROJECT);
  const [createFeature] = useMutation(CREATE_FEATURE);
  const [submitDraft] = useMutation(SUBMIT_DRAFT);
  const [deleteProject] = useMutation(DELETE_PROJECT);

  // ================= CREATE PROJECT =================
  const handleCreateProject = async () => {
    if (!projectName.trim()) return;

    const res = await createProject({
      variables: { name: projectName, description: "" },
    });

    setProjectName("");

    await refetch();

    // 🔥 AUTO SELECT NEW PROJECT (FIX BUG)
    const newProject = res?.data?.createProject;
    if (newProject) {
      setSelectedProject(newProject);
      setSelectedFeature(null);
    }
  };

  const handleCreateFeature = async () => {
    if (!selectedProject || !featureTitle.trim()) return;

    await createFeature({
      variables: {
        projectId: selectedProject.id,
        title: featureTitle,
        description: "",
      },
    });

    setFeatureTitle("");
    refetch();
  };

  const handleSubmitDraft = async () => {
    if (!selectedFeature || !draftContent.trim()) return;

    await submitDraft({
      variables: {
        featureId: selectedFeature.id,
        content: draftContent,
      },
    });

    setDraftContent("");
    refetchDrafts();
  };

  // ================= DELETE =================
  const handleDeleteProject = async (e: any, projectId: string) => {
    e.stopPropagation();

    await deleteProject({
      variables: { id: projectId },
    });

    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
      setSelectedFeature(null);
    }

    refetch();
  };

  // ================= SEND TO AI =================
  const handleSendToAI = () => {
    if (!draftContent.trim()) return;

    localStorage.setItem("ai_code", draftContent);
    window.location.href = "/ai-review";
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr 360px",
        gap: "16px",
        padding: "16px",
        height: "100vh",
        background: "#f5f7fb",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >

      {/* ================= LEFT ================= */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          padding: "16px",
          border: "1px solid #e5e7eb",
          overflowY: "auto",
        }}
      >
        <h2 style={{ marginBottom: "12px", color: "#1f2937" }}>
          📌 Projects
        </h2>

        <input
          placeholder="New project..."
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
          }}
        />

        <button
          onClick={handleCreateProject}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            background: "#395287",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          + Create Project
        </button>

        {/* PROJECT LIST */}
        <div style={{ marginTop: "16px" }}>
          {data?.myProjects?.map((p: any) => (
            <div
              key={p.id}
              onClick={() => {
                setSelectedProject(p);
                setSelectedFeature(null);
              }}
              style={{
                padding: "12px",
                marginTop: "10px",
                borderRadius: "12px",
                cursor: "pointer",
                background:
                  selectedProject?.id === p.id ? "#e0e7ff" : "#f9fafb",
                border:
                  selectedProject?.id === p.id
                    ? "2px solid #395287"
                    : "1px solid #e5e7eb",
                position: "relative",
                transition: "0.2s",
              }}
            >
              {/* DELETE */}
              <button
                onClick={(e) => handleDeleteProject(e, p.id)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "10px",
                  border: "none",
                  background: "transparent",
                  fontSize: "16px",
                  cursor: "pointer",
                  color: "#ef4444",
                }}
              >
                ✕
              </button>

              <b style={{ color: "#111827" }}>{p.name}</b>

              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                {p.features?.length || 0} features
              </div>

              {/* FEATURES */}
              <div style={{ marginTop: "6px", marginLeft: "10px" }}>
                {p.features?.map((f: any) => (
                  <div
                    key={f.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFeature(f);
                    }}
                    style={{
                      fontSize: "12px",
                      marginTop: "4px",
                      color:
                        selectedFeature?.id === f.id
                          ? "#395287"
                          : "#6b7280",
                      cursor: "pointer",
                    }}
                  >
                    • {f.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= CENTER ================= */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          padding: "16px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2 style={{ color: "#1f2937" }}>📝 Draft Workspace</h2>

        <p style={{ color: "#6b7280" }}>
          Project: <b>{selectedProject?.name || "None"}</b>
        </p>

        <p style={{ color: "#6b7280" }}>
          Feature: <b>{selectedFeature?.title || "None"}</b>
        </p>

        <textarea
          value={draftContent}
          onChange={(e) => setDraftContent(e.target.value)}
          placeholder="Write your code..."
          style={{
            width: "100%",
            height: "220px",
            marginTop: "10px",
            borderRadius: "12px",
            padding: "12px",
            border: "1px solid #d1d5db",
            fontFamily: "monospace",
          }}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleSubmitDraft}
            style={{
              marginTop: "12px",
              padding: "10px 14px",
              borderRadius: "10px",
              background: "#395287",
              border: "none",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Save Draft
          </button>

          <button
            onClick={handleSendToAI}
            style={{
              marginTop: "12px",
              padding: "10px 14px",
              borderRadius: "10px",
              background: "#10b981",
              border: "none",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Send to AI
          </button>
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          padding: "16px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 style={{ color: "#1f2937" }}>📄 Feature Panel</h3>

        {!selectedFeature ? (
          <p style={{ color: "#9ca3af" }}>Select a feature</p>
        ) : (
          <>
            <div
              style={{
                padding: "10px",
                borderRadius: "10px",
                background: "#f3f4f6",
              }}
            >
              <b>{selectedFeature.title}</b>
            </div>

            <h4 style={{ marginTop: "15px" }}>Drafts</h4>

            {draftsData?.drafts?.map((d: any) => (
              <div
                key={d.id}
                style={{
                  padding: "10px",
                  marginTop: "8px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                }}
              >
                {d.content}
              </div>
            ))}
          </>
        )}

        {/* ADD FEATURE */}
        {selectedProject && (
          <div style={{ marginTop: "25px" }}>
            <h4>➕ Add Feature</h4>

            <input
              value={featureTitle}
              onChange={(e) => setFeatureTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
              }}
            />

            <button
              onClick={handleCreateFeature}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                background: "#395287",
                border: "none",
                color: "white",
                fontWeight: 600,
              }}
            >
              Add Feature
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;