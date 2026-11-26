# Character asset notes

The sprite atlases and mapping data in this folder were supplied by Enrique in `Enrique_Platformer_Sprites_81_Frames.zip`. The archive README describes 81 transparent 256×256 frames in a 9×9 atlas, with 26 named animation sequences. The atlas preview and source metadata are preserved here.

The game uses these frames as a 2D sprite plane in a Three.js side-on 3D scene. Keep the alpha channel intact and use the independent gameplay collision dimensions rather than deriving physics from transparent image bounds. Enrique confirms that he created these character assets. Preserve the supplied archive and source metadata for traceability.

## What ships, and what does not

- **Shipped:** `atlas_game.webp` (1280×1280 lossless WebP, 455 kB) plus the trimmed
  `sprite_map.json`. It packs the 23 frames of the seven animations the game actually plays
  (`idle`, `run`, `jump_rise`, `jump_apex`, `fall`, `hurt`, `victory`).
- **Not shipped:** the supplied 2 304×2 304 `atlas_all.png` and the full 81-frame map. They live
  in `assets/character/` and are excluded from the deployed site because Vite only copies
  `public/`.
- Regenerate the shipped pair after any change to the source art:

  ```sh
  python3 scripts/pack_atlas.py
  ```

  The script crops each used frame by its recorded rect, repacks it on a 5×5 grid of 256 px
  cells and rewrites the map with the same frame ids, animation names and FPS values.

