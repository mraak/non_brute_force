export const horizontalTracks = [
  // [ total track count, start tile id, end tile id ]
  // tile ids start with 1. 0 means a track is removable

  // 1. floor
  [
    [ 1, 1, 1 ], // fixed

    [ 1, 2, 3 ],
    [ 1, 4, 5 ],
  ],
  // 2. floor
  [
    // [ 1, 0, 6 ], // empty

    [ 2, 7, 10 ],

    [ 4, 11, 17 ],

    // [ 1, 0, 18 ], // empty
    // [ 1, 0, 19 ],
    // [ 1, 0, 20 ],
    // [ 1, 0, 21 ],
    [ 1, 19, 21 ],

    // [ 1, 0, 22 ], // empty
  ],
  // 3. floor
  [
    // [ 1, 0, 23 ], // empty

    [ 2, 24, 28 ],

    [ 3, 29, 35 ],

    [ 3, 36, 41 ],

    // [ 1, 0, 42 ], // empty
  ],
  // 4. floor
  [
    // [ 2, 43, 47 ],
    [ 2, 43, 46 ], // 47 temp empty

    // [ 4, 48, 53 ],
    [ 3, 48, 52 ], // 53 temp empty

    // [ 2, 54, 58 ],
    [ 2, 54, 57 ], // 58 temp empty

    [ 1, 59, 59 ], // fixed
  ],
  // 5. floor
  null,
];

export const verticalTracks = [
  // [ total track count, start tile id, end tile id ]
  // tile ids start with 1. 0 means a track is removable

  // 1. floor
  null,
  // 2. floor
  null,
  // 3. floor
  null,
  // 4. floor
  null,
  // 5. floor
  [
    [ 1, 63, 68 ],

    [ 1, 64, 72 ],

    [ 2, 61, 73 ],

    [ 2, 60, 71 ],
  ],
];
