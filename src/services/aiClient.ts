import { apiClient } from "./apiClient";
import {
  generateBusinessAngles,
  generateBusinessScan,
  generateProofCheckQuestions,
  generateStartupDossier
} from "./generationService";
import { analyzeFounderFit } from "./founderFitService";
import type { BusinessAngle, BusinessScan, FounderProfile, ObservationInput, ProofCheckAnswer } from "../types";

export const aiClient = {
  async generateScan(input: ObservationInput) {
    const backend = await apiClient.ai.generateScan({ input }).catch(() => undefined);
    return backend ?? generateBusinessScan(input);
  },

  async generateAngles(input: ObservationInput) {
    const backend = await apiClient.ai.generateAngles({ input }).catch(() => undefined);
    return backend ?? generateBusinessAngles(input);
  },

  async generateProofQuestions(scan?: BusinessScan, angle?: BusinessAngle) {
    const backend = await apiClient.ai.generateProofQuestions({ scan, angle }).catch(() => undefined);
    return backend ?? generateProofCheckQuestions({ scan, angle });
  },

  async generateDossier(scan: BusinessScan, angle: BusinessAngle, proofAnswers: ProofCheckAnswer[]) {
    const backend = await apiClient.ai.generateDossier({ scan, angle, proofAnswers }).catch(() => undefined);
    return backend ?? generateStartupDossier(scan, angle, proofAnswers);
  },

  async founderFitAnalysis(
    input: ObservationInput,
    scan: BusinessScan | undefined,
    angle: BusinessAngle,
    proofAnswers: ProofCheckAnswer[],
    founderProfile?: FounderProfile
  ) {
    const backend = await apiClient.ai.founderFitAnalysis({ input, scan, angle, proofAnswers, founderProfile }).catch(() => undefined);
    return backend ?? analyzeFounderFit(input, scan, angle, proofAnswers, founderProfile);
  }
};
