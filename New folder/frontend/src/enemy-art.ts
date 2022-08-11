import img1 from './assets/enemies/monster-1.gif';
import img2 from './assets/enemies/monster-2.gif';
import img3 from './assets/enemies/monster-3.gif';
import img4 from './assets/enemies/monster-4.gif';
import img5 from './assets/enemies/monster-5.gif';
import img6 from './assets/enemies/monster-6.gif';
import img7 from './assets/enemies/monster-7.gif';
import img8 from './assets/enemies/monster-8.gif';
import img9 from './assets/enemies/monster-9.gif';
import img10 from './assets/enemies/monster-10.gif';

const allImages = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];

export function getEnemyArt(enemyID: number) {
  return allImages[enemyID % allImages.length];
}
