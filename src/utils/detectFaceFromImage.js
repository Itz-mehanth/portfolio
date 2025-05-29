// src/utils/detectFaceFromImage.js
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

let faceLandmarker;

export async function detectFaceFromImage(image) {
  if (!faceLandmarker) {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          '/face_landmarker.task',
      },
      runningMode: 'IMAGE',
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
      numFaces: 1,
    });
  }

  const result = faceLandmarker.detect(image);
  return result;
}
