#!/usr/bin/env python3
"""Pack the character sprite sheet used by the game.

The supplied art ships a 2304x2304 atlas with 26 animations (81 frames).
The game only plays seven of them, so this script repacks those frames into a
small lossless WebP atlas and rewrites sprite_map.json to match.

Source (not deployed): assets/character/atlas_all.png + assets/character/sprite_map.source.json
Output (deployed):     public/character/atlas_game.webp + public/character/sprite_map.json

Run from the repository root:  python3 scripts/pack_atlas.py
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE_ATLAS = ROOT / "assets" / "character" / "atlas_all.png"
SOURCE_MAP = ROOT / "assets" / "character" / "sprite_map.source.json"
OUT_ATLAS = ROOT / "public" / "character" / "atlas_game.webp"
OUT_MAP = ROOT / "public" / "character" / "sprite_map.json"

ATLAS_NAME = "atlas_game.webp"
SOURCE_ATLAS_NAME = "atlas_all.png"
USED_ANIMATIONS = ("idle", "run", "jump_rise", "jump_apex", "fall", "hurt", "victory")
CELL = 256


def main() -> int:
    atlas = Image.open(SOURCE_ATLAS).convert("RGBA")
    mapping = json.loads(SOURCE_MAP.read_text())

    animations = {name: mapping["animations"][name] for name in USED_ANIMATIONS}
    frame_ids = []
    for animation in animations.values():
        for frame_id in animation["frames"]:
            if frame_id not in frame_ids:
                frame_ids.append(frame_id)

    columns = 5
    rows = (len(frame_ids) + columns - 1) // columns
    packed = Image.new("RGBA", (columns * CELL, rows * CELL), (0, 0, 0, 0))

    frames = {}
    for index, frame_id in enumerate(frame_ids):
        source = mapping["frames"][frame_id]
        rect = source["rects"][SOURCE_ATLAS_NAME]
        tile = atlas.crop((rect["x"], rect["y"], rect["x"] + rect["w"], rect["y"] + rect["h"]))
        if tile.size != (CELL, CELL):
            tile = tile.resize((CELL, CELL), Image.Resampling.LANCZOS)
        x = (index % columns) * CELL
        y = (index // columns) * CELL
        packed.paste(tile, (x, y))
        frames[frame_id] = {
            "action": source["action"],
            "frame_index": source["frame_index"],
            "image": source["image"],
            "rects": {ATLAS_NAME: {"x": x, "y": y, "w": CELL, "h": CELL}},
            "source": source.get("source", {}),
        }

    OUT_ATLAS.parent.mkdir(parents=True, exist_ok=True)
    packed.save(OUT_ATLAS, format="WEBP", lossless=True, quality=100, method=6)

    output = {
        "format": mapping.get("format"),
        "cell": mapping.get("cell"),
        "atlas": {
            "game": {
                "file": ATLAS_NAME,
                "width": packed.width,
                "height": packed.height,
                "columns": columns,
                "rows": rows,
                "cell_width": CELL,
                "cell_height": CELL,
                "alpha": True,
            }
        },
        "total_animations": len(animations),
        "total_frames": len(frames),
        "animations": animations,
        "frames": frames,
    }
    OUT_MAP.write_text(json.dumps(output, ensure_ascii=False, indent=1) + "\n")

    print(f"{OUT_ATLAS.relative_to(ROOT)}  {OUT_ATLAS.stat().st_size / 1024:.0f} kB  {packed.width}x{packed.height}")
    print(f"{OUT_MAP.relative_to(ROOT)}  {OUT_MAP.stat().st_size / 1024:.0f} kB  frames={len(frames)} animations={len(animations)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
