/**
 * 레이아웃 레지스트리.
 *
 * 레이아웃은 "화면 구조"를 정한다 — 사진이 어디에 어떤 모양으로 놓이고,
 * 가사가 어느 자리에 어떤 방식(한 줄 자막 / 흐르는 목록)으로 앉는지.
 * 색·서체·효과 강도는 테마(themes.js)가 따로 맡는다.
 *
 * drawFrame은 여기서 고른 함수 하나만 부르고, 그 위에 그레인·타이틀 같은
 * 공통 오버레이를 얹는다.
 */

import { drawCinema } from './cinema.js';
import { drawMarquee } from './marquee.js';
import { drawDefile } from './defile.js';
import { drawCarte } from './carte.js';
import { drawDuplex } from './duplex.js';
import { drawVinyl3 } from './vinyl3.js';

export const LAYOUTS = {
  cinema: {
    label: 'Cinéma · 시네마 자막',
    description: '2.39:1 화면 가득 사진, 영화 자막처럼 아래에 가사.',
    draw: drawCinema,
  },
  marquee: {
    label: 'Marquee · 밤의 간판',
    description: '가사가 화면 한가운데. 사진은 아주 어두운 배경으로만.',
    draw: drawMarquee,
  },
  defile: {
    label: 'Défilé · 흐르는 가사',
    description: '가사 여러 줄이 세로로 흐르고 사진은 옆 컬럼에.',
    draw: drawDefile,
  },
  carte: {
    label: 'Carte Postale · 엽서',
    description: '사진을 기울인 카드로, 가사는 옆에 편집 지면처럼.',
    draw: drawCarte,
  },
  duplex: {
    label: 'Duplex · 2단',
    description: '위 사진 / 아래 가사 패널. 가독성이 가장 높음.',
    draw: drawDuplex,
  },
  vinyl3: {
    label: 'Vinyl · 3분할 LP',
    description: '좌우 사진 + 중앙 회전 LP. 첫 번째 구성.',
    draw: drawVinyl3,
  },
};

export const drawLayout = (ctx, scene, env, t) => {
  const layout = LAYOUTS[scene.project.layout] || LAYOUTS.vinyl3;
  layout.draw(ctx, scene, env, t);
};
