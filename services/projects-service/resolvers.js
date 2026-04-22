import Project from "../models/Project.js";
import Feature from "../models/Feature.js";
import Draft from "../models/Draft.js";
import axios from "axios";
export const resolvers = {
  Query: {
    myProjects: async (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized");
      return await Project.find({ ownerId: user.id });
    },

    project: async (_, { id }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const project = await Project.findById(id);
      if (!project) throw new Error("Not Found");

      if (project.ownerId !== user.id) throw new Error("Forbidden");

      return project;
    },

    drafts: async (_, { featureId }) => {
      return await Draft.find({ featureId }).sort({ createdAt: -1 });
    }
  },

  Mutation: {
    // ================= CREATE =================
    createProject: async (_, { name, description }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      return await Project.create({
        name,
        description,
        ownerId: user.id
      });
    },

    addFeature: async (_, { projectId, title, description }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const project = await Project.findById(projectId);
      if (!project) throw new Error("Project not found");

      if (project.ownerId !== user.id) throw new Error("Forbidden");

      return await Feature.create({
        projectId,
        title,
        description
      });
    },

    submitDraft: async (_, { featureId, content }) => {
  const feature = await Feature.findById(featureId);
  if (!feature) throw new Error("Feature not found");

  const draft = await Draft.create({
    featureId,
    content
  });

  //  CALL AI SERVICE (IMPORTANT)
  try {
    const aiRes = await axios.post("http://localhost:4003/review", {
      content
    });

    console.log("AI result:", aiRes.data);

    draft.aiResult = aiRes.data;

    return draft;
  } catch (err) {
    console.log("AI service failed:", err.message);
    return draft;
  }
},

    // ================= DELETE PROJECT (NEW) =================
    deleteProject: async (_, { id }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const project = await Project.findById(id);
      if (!project) throw new Error("Project not found");

      if (project.ownerId !== user.id) throw new Error("Forbidden");

      // delete related data (optional but clean)
      await Feature.deleteMany({ projectId: id });
      await Project.findByIdAndDelete(id);

      return true;
    }
  },

  // ================= RESOLVERS =================
  Project: {
    features: async (project) => {
      return await Feature.find({ projectId: project.id });
    }
  },

  Feature: {
    drafts: async (feature) => {
      return await Draft.find({ featureId: feature.id });
    }
  }
};