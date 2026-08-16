/**
 * 중앙 원형 LP 레이어.
 *
 * 검은 비닐판 없이 "사진 한 장이 원 전체"인 구성.
 * 사진은 고정(project.vinyl.photo)이고 시계 방향으로 천천히 돈다.
 * 테두리 얇은 골드 링 + 은/금 톤암만 얹어 LP라는 걸 읽히게 한다.
 */

import { clamp, drawCover, easeOutCubic, norm, rgba, smoothstep } from '../util.js';
import { transitionPulse } from '../timeline.js';

const TAU = Math.PI * 2;

/**
 * 톤암 — 얇은 은색 튜브 + 금색 포인트.
 *
 * 접점을 먼저 정하고 피벗에서 그 점으로 팔을 그린다.
 * 각도를 손으로 박아두면 원 크기를 바꿀 때마다 바늘이 사진을 벗어난다.
 */
const drawTonearm = (ctx, cx, cy, R, accent, t, progress) => {
  const pivotX = cx + R * 1.06;
  const pivotY = cy - R * 0.98;

  // 곡이 진행될수록 바늘이 바깥에서 안쪽으로
  const track = clamp(progress, 0, 1);
  const stylusR = R * (0.95 - 0.45 * track);
  const stylusAngle = -Math.PI * 0.3 + Math.sin(t * 0.5) * 0.003;
  const tx = cx + Math.cos(stylusAngle) * stylusR;
  const ty = cy + Math.sin(stylusAngle) * stylusR;

  const armLen = Math.hypot(tx - pivotX, ty - pivotY);
  const armAngle = Math.atan2(ty - pivotY, tx - pivotX);

  // 굵기는 원 크기에 비례하되 상한을 둬서 4K에서도 가늘게 유지
  const tube = Math.min(R * 0.009, 5);

  ctx.save();
  ctx.translate(pivotX, pivotY);
  ctx.rotate(armAngle);
  ctx.lineCap = 'round';

  // 그림자 한 겹 — 사진 위에서 팔이 뜬 것처럼 보이게
  ctx.strokeStyle = 'rgba(0,0,0,0.28)';
  ctx.lineWidth = tube * 2.2;
  ctx.beginPath();
  ctx.moveTo(-R * 0.14, tube * 1.6);
  ctx.lineTo(armLen - tube * 3, tube * 1.6);
  ctx.stroke();

  // 은색 튜브
  const silver = ctx.createLinearGradient(0, -tube, 0, tube);
  silver.addColorStop(0, '#f2f2f0');
  silver.addColorStop(0.45, '#cfcfcc');
  silver.addColorStop(1, '#8e8e8b');
  ctx.strokeStyle = silver;
  ctx.lineWidth = tube;
  ctx.beginPath();
  ctx.moveTo(-R * 0.14, 0);
  ctx.lineTo(armLen - tube * 3, 0);
  ctx.stroke();

  // 금색 밴드 두 줄
  ctx.strokeStyle = rgba(accent, 0.95);
  ctx.lineWidth = tube;
  ctx.beginPath();
  ctx.moveTo(-R * 0.14, 0);
  ctx.lineTo(-R * 0.075, 0);
  ctx.moveTo(armLen * 0.52, 0);
  ctx.lineTo(armLen * 0.58, 0);
  ctx.stroke();

  // 헤드셸 — 작은 금색 쐐기
  ctx.save();
  ctx.translate(armLen - tube * 3, 0);
  ctx.rotate(0.3);
  ctx.fillStyle = rgba(accent, 0.95);
  ctx.beginPath();
  ctx.moveTo(0, -tube * 1.5);
  ctx.lineTo(tube * 5, -tube * 0.7);
  ctx.lineTo(tube * 5, tube * 0.7);
  ctx.lineTo(0, tube * 1.5);
  ctx.closePath();
  ctx.fill();
  // 바늘
  ctx.strokeStyle = 'rgba(245,245,242,0.9)';
  ctx.lineWidth = tube * 0.5;
  ctx.beginPath();
  ctx.moveTo(tube * 5, 0);
  ctx.lineTo(tube * 7.5, tube * 1.2);
  ctx.stroke();
  ctx.restore();

  ctx.restore();

  // 피벗 — 작은 이중 원 (은 바깥 / 금 안쪽)
  ctx.save();
  ctx.translate(pivotX, pivotY);
  const base = ctx.createLinearGradient(-tube * 3, -tube * 3, tube * 3, tube * 3);
  base.addColorStop(0, '#eeeeec');
  base.addColorStop(1, '#9a9a97');
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(0, 0, tube * 3, 0, TAU);
  ctx.fill();
  ctx.fillStyle = rgba(accent, 0.95);
  ctx.beginPath();
  ctx.arc(0, 0, tube * 1.3, 0, TAU);
  ctx.fill();
  ctx.restore();
};

/** 고정 사진 결정: vinyl.photo가 없으면 첫 번째 사진으로 폴백 */
const resolveLabelSrc = (scene) => {
  const explicit = scene.project.vinyl.photo;
  if (explicit) return explicit;
  return scene.project.photos.items?.[0]?.src || null;
};

export const drawVinyl = (ctx, scene, env, t) => {
  const v = scene.project.vinyl;
  if (!v.enabled) return;

  const { width: W, height: H } = env;
  const short = Math.min(W, H);

  // 등장
  const introDur = scene.project.intro?.enabled ? scene.project.intro.duration : 0;
  const appearAt = Math.max(0, introDur - 1.8);
  let appear = 1;
  let dropY = 0;
  if (v.entrance !== 'none' && introDur > 0) {
    appear = smoothstep(norm(t, appearAt, appearAt + 1.6));
    if (v.entrance === 'drop') dropY = (1 - easeOutCubic(appear)) * -short * 0.12;
  }
  if (appear <= 0.001) return;

  // 아웃트로 페이드
  const outro = scene.project.outro;
  if (outro?.enabled) {
    const outStart = scene.total - outro.duration;
    appear *= 1 - smoothstep(norm(t, outStart, outStart + 1.4));
    if (appear <= 0.001) return;
  }

  const pulse = v.beatPulse ? transitionPulse(scene.timeline, t, 0.85) * v.beatPulse : 0;
  const R = (short * v.sizeRatio * (1 + pulse)) / 2;
  const cx = W * v.centerX;
  const cy = H * v.centerY + dropY;
  // 양수 회전 = 시계 방향
  const angle = (((v.rpm || 0) / 60) * t * TAU) % TAU;

  ctx.save();
  ctx.globalAlpha = appear;

  // 바닥 그림자 — 원이 배경에서 떠 보이게
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = R * 0.2;
  ctx.shadowOffsetY = R * 0.05;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.99, 0, TAU);
  ctx.fill();
  ctx.restore();

  ctx.translate(cx, cy);

  // ---- 사진이 원 전체 ----
  ctx.save();
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, TAU);
  ctx.clip();

  const src = resolveLabelSrc(scene);
  const img = env.getImage(src);
  const photo = scene.project.photos.items?.find((p) => p.src === src);
  const d = R * 2;

  if (img) {
    // 회전하는 원 안에서는 사진 모서리가 보이면 안 되므로 지름의 √2배로 덮는다
    const cover = d * 1.42;
    drawCover(ctx, img, -cover / 2, -cover / 2, cover, cover,
      photo?.focusX ?? 0.5, photo?.focusY ?? 0.45);
  } else {
    ctx.fillStyle = '#2a2520';
    ctx.fillRect(-R, -R, d, d);
  }

  // 아주 옅은 홈 — 켜면 사진 위에 LP 질감이 얹힌다 (기본 꺼짐)
  if (v.grooves) {
    ctx.lineWidth = Math.max(0.6, R * 0.0018);
    for (let r = R * 0.16; r < R * 0.98; r += Math.max(2.5, R * 0.014)) {
      ctx.strokeStyle = `rgba(0,0,0,${0.05 + 0.05 * (r / R)})`;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.stroke();
    }
  }

  ctx.restore();

  // 안쪽 음영 — 가장자리를 살짝 눌러 원의 입체감
  const inner = ctx.createRadialGradient(0, -R * 0.3, R * 0.1, 0, 0, R);
  inner.addColorStop(0, 'rgba(255,255,255,0.05)');
  inner.addColorStop(0.72, 'rgba(0,0,0,0)');
  inner.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = inner;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, TAU);
  ctx.fill();

  // 회전 광택 — 원 위를 쓸고 지나가는 빛
  if (v.sheen) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.rotate(angle * 0.6);
    const sheen = ctx.createLinearGradient(-R, -R, R, R);
    sheen.addColorStop(0.0, 'rgba(255,255,255,0)');
    sheen.addColorStop(0.4, 'rgba(255,248,235,0.05)');
    sheen.addColorStop(0.5, 'rgba(255,250,240,0.11)');
    sheen.addColorStop(0.6, 'rgba(255,248,235,0.04)');
    sheen.addColorStop(1.0, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // 얇은 골드 링 + 바깥 하이라이트
  ctx.strokeStyle = rgba(v.ringColor, 0.85);
  ctx.lineWidth = Math.max(1.5, R * 0.008);
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.996, 0, TAU);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = Math.max(1, R * 0.003);
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.978, 0, TAU);
  ctx.stroke();

  // 스핀들 홀 — 회전 중심을 잡아준다
  if (v.spindle) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.022, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = rgba(v.ringColor, 0.6);
    ctx.lineWidth = Math.max(0.8, R * 0.0025);
    ctx.stroke();
  }

  ctx.restore();

  if (v.tonearm) {
    ctx.save();
    ctx.globalAlpha = appear;
    drawTonearm(ctx, cx, cy, R, scene.project.theme.accent, t, t / scene.total);
    ctx.restore();
  }
};
