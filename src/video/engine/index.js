/** 엔진 공개 API — 스튜디오와 CLI 렌더러가 여기서만 가져다 쓴다 */

export { drawFrame, requiredSources } from './drawFrame.js';
export { buildScene, buildPhotoTimeline, photoStateAt } from './timeline.js';
export { parseLRC, serializeLRC, findLineIndex, toLrcTime } from './lrc.js';
export {
  createDefaultProject, mergeProject, defaultPhotos,
  CANVAS_PRESETS, INVITATION_PHOTOS, PROJECT_VERSION,
} from './config.js';
export { formatTime } from './util.js';
